import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  columns: z
    .array(
      z.object({
        id: z.string().uuid(),
        suggestion: z.string().min(1).max(64),
        ignored: z.boolean().optional(),
      })
    )
    .max(200),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  }

  const uploadId = params.id;

  // RLS: can only read uploads from our business
  const { data: upload, error: readErr } = await supabase
    .from("file_uploads")
    .select("id")
    .eq("id", uploadId)
    .maybeSingle();

  if (readErr || !upload) {
    return NextResponse.json(
      { error: "We couldn't find this upload." },
      { status: 404 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Something went wrong saving your mapping. Please try again." },
      { status: 400 }
    );
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Help us match your columns before we build your dashboard." },
      { status: 422 }
    );
  }

  // Apply updates one by one (Supabase doesn't have bulk-upsert-by-id in one call
  // that sets different values per row without loading rows first; this is fine
  // for <= 200 columns in Phase 2).
  for (const c of parsed.data.columns) {
    const { error } = await supabase
      .from("detected_columns")
      .update({
        suggestion: c.suggestion,
        ignored: c.ignored ?? c.suggestion === "Ignore",
      })
      .eq("id", c.id)
      .eq("file_upload_id", uploadId);
    if (error) {
      console.error("[api/uploads/mapping] update error:", error);
      return NextResponse.json(
        { error: "We couldn't save your mapping. Please try again." },
        { status: 500 }
      );
    }
  }

  await supabase
    .from("file_uploads")
    .update({ status: "mapped" })
    .eq("id", uploadId);

  return NextResponse.json({ ok: true });
}
