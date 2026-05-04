import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { parseUploadedFile } from "@/lib/parse-file";
import {
  buildBronzeRows,
  resolveMapping,
  applyMappingToRow,
  type ResolvedMapping,
  type MappedRow,
} from "@/lib/processing/bronze";
import { validateMappedRows } from "@/lib/processing/validation";
import { buildSilver } from "@/lib/processing/silver";
import { buildGold } from "@/lib/processing/gold";
import { buildInsights } from "@/lib/processing/insights";
import { normalizeEmail } from "@/lib/processing/parse-values";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const INSERT_CHUNK = 500;

async function chunkedInsert(
  supabase: SupabaseClient,
  table: string,
  rows: readonly unknown[]
): Promise<{ error: string | null }> {
  for (let i = 0; i < rows.length; i += INSERT_CHUNK) {
    const slice = rows.slice(i, i + INSERT_CHUNK);
    const { error } = await supabase.from(table).insert(slice as never);
    if (error) {
      console.error(`[process] insert into ${table} failed:`, error);
      return { error: error.message };
    }
  }
  return { error: null };
}

async function markFailed(
  supabase: SupabaseClient,
  uploadId: string,
  message: string
) {
  await supabase
    .from("file_uploads")
    .update({ status: "failed", error_message: message })
    .eq("id", uploadId);
}

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const uploadId = params.id;

  // ---- Auth ----
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  }

  // ---- Upload (RLS enforces access) ----
  const { data: upload, error: upErr } = await supabase
    .from("file_uploads")
    .select(
      "id, business_id, filename, source, storage_path, status, row_count"
    )
    .eq("id", uploadId)
    .maybeSingle();

  if (upErr || !upload) {
    return NextResponse.json(
      { error: "We couldn't find this upload." },
      { status: 404 }
    );
  }
  if (!upload.storage_path) {
    return NextResponse.json(
      { error: "We couldn't locate the original file. Please upload it again." },
      { status: 409 }
    );
  }

  // Allow reprocessing from mapped/processed/failed states. Disallow only the
  // in-between "processing" state to avoid concurrent runs, and disallow
  // pre-mapping states so users always confirm their mapping first.
  if (upload.status === "processing") {
    return NextResponse.json(
      { error: "This file is already being built. Give it a moment." },
      { status: 409 }
    );
  }
  if (upload.status === "uploaded" || upload.status === "parsed") {
    return NextResponse.json(
      {
        error:
          "Please finish matching your columns first, then click Build my dashboard.",
        redirect: `/dashboard/mapping/${uploadId}`,
      },
      { status: 409 }
    );
  }

  // ---- Load business currency ----
  const { data: business } = await supabase
    .from("businesses")
    .select("currency")
    .eq("id", upload.business_id)
    .maybeSingle();
  const currency = business?.currency ?? null;

  // ---- Load saved column mapping ----
  const { data: cols } = await supabase
    .from("detected_columns")
    .select("original, suggestion, ignored")
    .eq("file_upload_id", uploadId);

  const mapping: ResolvedMapping = resolveMapping(
    (cols ?? []).map((c) => ({
      original: c.original,
      suggestion: c.suggestion,
      ignored: !!c.ignored,
    }))
  );

  // ---- Mark processing (race-safe, RLS-aware) ----
  // Conditional update: only transition from mapped/processed/failed. If some
  // other request already moved this row to 'processing' between our earlier
  // SELECT and this UPDATE, no row matches and we return a friendly 409. RLS
  // still applies (business_users membership), so tenant isolation is unchanged.
  const { data: claimed, error: claimErr } = await supabase
    .from("file_uploads")
    .update({ status: "processing", error_message: null })
    .eq("id", uploadId)
    .in("status", ["mapped", "processed", "failed"])
    .select("id")
    .maybeSingle();

  if (claimErr) {
    console.error("[process] status claim error:", claimErr);
    return NextResponse.json(
      { error: "Something went wrong starting this build. Please try again." },
      { status: 500 }
    );
  }
  if (!claimed) {
    return NextResponse.json(
      { error: "This file is already being built. Give it a moment." },
      { status: 409 }
    );
  }

  try {
    // ---- Download the original file ----
    const { data: fileBlob, error: dlErr } = await supabase.storage
      .from("uploads")
      .download(upload.storage_path);
    if (dlErr || !fileBlob) {
      await markFailed(
        supabase,
        uploadId,
        "We couldn't read the original file from storage."
      );
      return NextResponse.json(
        { error: "We couldn't read your uploaded file. Please upload it again." },
        { status: 500 }
      );
    }

    const buffer = await fileBlob.arrayBuffer();
    const parsed = parseUploadedFile(upload.filename, buffer);

    if (parsed.rows.length === 0) {
      await markFailed(
        supabase,
        uploadId,
        "The file has no rows we can read."
      );
      return NextResponse.json(
        {
          error:
            "We couldn't find any rows with data. Try exporting again from your store.",
        },
        { status: 422 }
      );
    }

    // ---- Mapped rows + validation ----
    const mappedRows: MappedRow[] = parsed.rows.map((r) =>
      applyMappingToRow(r, mapping)
    );
    const validation = validateMappedRows(mappedRows, mapping);

    // Clear prior processing artifacts for this upload (idempotent rebuild).
    await supabase
      .from("data_quality_results")
      .delete()
      .eq("file_upload_id", uploadId);
    await supabase
      .from("data_quality_runs")
      .delete()
      .eq("file_upload_id", uploadId);

    // Create the quality run row.
    const { data: runRow, error: runErr } = await supabase
      .from("data_quality_runs")
      .insert({
        business_id: upload.business_id,
        file_upload_id: uploadId,
        status: validation.status,
        total_rows: validation.total_rows,
        warning_count: validation.warning_count,
        error_count: validation.error_count,
      })
      .select("id")
      .single();

    if (runErr || !runRow) {
      console.error("[process] dq_runs insert:", runErr);
    }

    if (validation.results.length > 0 && runRow) {
      const resultRows = validation.results.map((r) => ({
        run_id: runRow.id,
        business_id: upload.business_id,
        file_upload_id: uploadId,
        rule_name: r.rule_name,
        severity: r.severity,
        affected_rows: r.affected_rows,
        message: r.message,
        suggested_fix: r.suggested_fix ?? null,
      }));
      await chunkedInsert(supabase, "data_quality_results", resultRows);
    }

    if (validation.critical) {
      await markFailed(
        supabase,
        uploadId,
        validation.critical_reason ?? "Validation failed."
      );
      return NextResponse.json(
        {
          error:
            validation.critical_reason ??
            "We couldn't build your dashboard from this file yet.",
          validation: validation.results,
        },
        { status: 422 }
      );
    }

    // ---- Bronze ----
    // Remove any previous bronze rows for this upload, then insert fresh.
    await supabase
      .from("bronze_raw_rows")
      .delete()
      .eq("file_upload_id", uploadId);
    const bronze = buildBronzeRows({
      businessId: upload.business_id,
      fileUploadId: uploadId,
      sourceSystem: upload.source ?? null,
      rows: parsed.rows,
      mapping,
    });
    const bronzeRes = await chunkedInsert(supabase, "bronze_raw_rows", bronze);
    if (bronzeRes.error) throw new Error("bronze insert failed");

    // ---- Silver (this upload) ----
    // Delete this upload's previous silver rows; items cascade on order delete.
    await supabase
      .from("order_items_silver")
      .delete()
      .eq("file_upload_id", uploadId);
    await supabase
      .from("orders_silver")
      .delete()
      .eq("file_upload_id", uploadId);

    const silver = buildSilver({
      businessId: upload.business_id,
      fileUploadId: uploadId,
      rows: mappedRows,
      mapping,
      currency,
    });

    // Insert orders and read back ids keyed by _localId.
    // Postgrest returns rows in insert order, so we insert and .select("id")
    // then match by array index within each chunk.
    const orderInsertPayload = silver.orders.map(({ _localId, ...rest }) => rest);
    const localIdByIndex = silver.orders.map((o) => o._localId);

    const localToDbId = new Map<string, string>();
    for (let i = 0; i < orderInsertPayload.length; i += INSERT_CHUNK) {
      const slice = orderInsertPayload.slice(i, i + INSERT_CHUNK);
      const { data: inserted, error: oErr } = await supabase
        .from("orders_silver")
        .insert(slice)
        .select("id");
      if (oErr || !inserted) {
        console.error("[process] orders_silver insert:", oErr);
        throw new Error("orders insert failed");
      }
      inserted.forEach((row, j) => {
        const local = localIdByIndex[i + j];
        if (local) localToDbId.set(local, row.id);
      });
    }

    // Items reference real order ids now.
    const itemRows = silver.items.map((it) => {
      const { order_silver_local_id, ...rest } = it;
      return {
        ...rest,
        order_id: localToDbId.get(order_silver_local_id) ?? null,
      };
    });
    const itemRes = await chunkedInsert(supabase, "order_items_silver", itemRows);
    if (itemRes.error) throw new Error("items insert failed");

    // Upsert customers + products (this upload's contributions merged into existing).
    if (silver.customers.length > 0) {
      const { error: cErr } = await supabase
        .from("customers_silver")
        .upsert(silver.customers, {
          onConflict: "business_id,customer_key",
        });
      if (cErr) console.error("[process] customers upsert:", cErr);
    }
    if (silver.products.length > 0) {
      const { error: pErr } = await supabase
        .from("products_silver")
        .upsert(silver.products, {
          onConflict: "business_id,product_key",
        });
      if (pErr) console.error("[process] products upsert:", pErr);
    }

    // ---- Gold (rebuild full business from silver) ----
    // Reload all silver orders + items for this business so gold reflects
    // every processed upload, not just this one. (Spec: rebuild gold for the
    // whole business after each processed upload.)
    const { data: allOrders, error: ordErr } = await supabase
      .from("orders_silver")
      .select(
        "id, business_id, file_upload_id, source_order_id, order_date, customer_key, customer_name, customer_email, sales_channel, subtotal_amount, discount_amount, tax_amount, shipping_amount, total_amount, refund_amount, net_amount, currency"
      )
      .eq("business_id", upload.business_id);
    if (ordErr) {
      console.error("[process] reload orders:", ordErr);
      throw new Error("reload orders failed");
    }
    const { data: allItems, error: itErr } = await supabase
      .from("order_items_silver")
      .select(
        "id, order_id, product_key, product_name, sku, category, quantity, unit_price, gross_item_amount, discount_amount, refund_amount, net_item_amount"
      )
      .eq("business_id", upload.business_id);
    if (itErr) {
      console.error("[process] reload items:", itErr);
      throw new Error("reload items failed");
    }

    // Map to the gold input shape (use order.id as the local id).
    const goldOrders = (allOrders ?? []).map((o) => ({
      _localId: o.id as string,
      business_id: o.business_id as string,
      file_upload_id: o.file_upload_id as string | null,
      source_order_id: o.source_order_id as string | null,
      order_date: o.order_date as string | null,
      customer_key: o.customer_key as string | null,
      customer_name: o.customer_name as string | null,
      customer_email: o.customer_email as string | null,
      sales_channel: o.sales_channel as string | null,
      subtotal_amount: Number(o.subtotal_amount ?? 0),
      discount_amount: Number(o.discount_amount ?? 0),
      tax_amount: Number(o.tax_amount ?? 0),
      shipping_amount: Number(o.shipping_amount ?? 0),
      total_amount: Number(o.total_amount ?? 0),
      refund_amount: Number(o.refund_amount ?? 0),
      net_amount: Number(o.net_amount ?? 0),
      currency: o.currency as string | null,
    }));
    const goldItems = (allItems ?? []).map((it) => ({
      business_id: upload.business_id,
      file_upload_id: uploadId,
      order_silver_local_id: it.order_id as string,
      source_order_id: null,
      product_key: it.product_key as string | null,
      product_name: it.product_name as string | null,
      sku: it.sku as string | null,
      category: it.category as string | null,
      quantity: Number(it.quantity ?? 0),
      unit_price: Number(it.unit_price ?? 0),
      gross_item_amount: Number(it.gross_item_amount ?? 0),
      discount_amount: Number(it.discount_amount ?? 0),
      refund_amount: Number(it.refund_amount ?? 0),
      net_item_amount: Number(it.net_item_amount ?? 0),
    }));

    const gold = buildGold({
      businessId: upload.business_id,
      orders: goldOrders,
      items: goldItems,
    });

    // Wipe and rewrite gold tables for this business.
    await supabase
      .from("gold_daily_sales")
      .delete()
      .eq("business_id", upload.business_id);
    await supabase
      .from("gold_monthly_sales")
      .delete()
      .eq("business_id", upload.business_id);
    await supabase
      .from("gold_product_performance")
      .delete()
      .eq("business_id", upload.business_id);
    await supabase
      .from("gold_customer_summary")
      .delete()
      .eq("business_id", upload.business_id);
    await supabase
      .from("gold_business_insights")
      .delete()
      .eq("business_id", upload.business_id);

    if (gold.daily.length > 0) {
      const r = await chunkedInsert(supabase, "gold_daily_sales", gold.daily);
      if (r.error) throw new Error("gold_daily insert failed");
    }
    if (gold.monthly.length > 0) {
      const r = await chunkedInsert(supabase, "gold_monthly_sales", gold.monthly);
      if (r.error) throw new Error("gold_monthly insert failed");
    }
    if (gold.products.length > 0) {
      const r = await chunkedInsert(
        supabase,
        "gold_product_performance",
        gold.products
      );
      if (r.error) throw new Error("gold_products insert failed");
    }
    if (gold.customers.length > 0) {
      const r = await chunkedInsert(
        supabase,
        "gold_customer_summary",
        gold.customers
      );
      if (r.error) throw new Error("gold_customers insert failed");
    }

    // ---- Insights ----
    const totalRows = mappedRows.length;
    const missingEmail = mappedRows.filter(
      (r) => !normalizeEmail(r.customer_email)
    ).length;
    const missingEmailPct = totalRows > 0 ? (missingEmail / totalRows) * 100 : 0;

    const insights = buildInsights({
      businessId: upload.business_id,
      fileUploadId: uploadId,
      currency,
      daily: gold.daily,
      monthly: gold.monthly,
      products: gold.products,
      customers: gold.customers,
      missingEmailPct,
    });

    if (insights.length > 0) {
      const r = await chunkedInsert(
        supabase,
        "gold_business_insights",
        insights
      );
      if (r.error) throw new Error("insights insert failed");
    }

    // ---- Mark processed ----
    await supabase
      .from("file_uploads")
      .update({
        status: "processed",
        error_message: null,
        row_count: parsed.totalRows,
      })
      .eq("id", uploadId);

    return NextResponse.json({
      ok: true,
      redirect: "/dashboard",
      totalRows: parsed.totalRows,
      ordersCreated: silver.orders.length,
      dailyPoints: gold.daily.length,
      insights: insights.length,
      validation: {
        status: validation.status,
        warning_count: validation.warning_count,
        error_count: validation.error_count,
      },
    });
  } catch (err) {
    console.error("[process] unexpected failure:", err);
    await markFailed(
      supabase,
      uploadId,
      "Something went wrong while building your dashboard."
    );
    return NextResponse.json(
      {
        error:
          "Something went wrong while building your dashboard. Please try again.",
      },
      { status: 500 }
    );
  }
}
