"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  UploadCloud,
  FileSpreadsheet,
  FileText,
  Store,
  Coffee,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type UploadState =
  | { kind: "idle" }
  | { kind: "uploading"; progress: number }
  | { kind: "success"; rows: number; redirect: string }
  | { kind: "error"; message: string };

const samples = [
  {
    icon: Store,
    label: "Boutique sales",
    file: "boutique_sales_messy.csv",
    description: "Mixed Shopify + in-store rows, messy column names.",
  },
  {
    icon: Coffee,
    label: "Café register",
    file: "cafe_sales_messy.csv",
    description: "Square exports with transaction-level rows.",
  },
  {
    icon: Sparkles,
    label: "Etsy-style shop",
    file: "etsy_shop_sales_messy.csv",
    description: "Item-level sales with fees and shipping.",
  },
];

const MAX_MB = 10;

export function UploadDropzone() {
  const router = useRouter();
  const [dragging, setDragging] = useState(false);
  const [state, setState] = useState<UploadState>({ kind: "idle" });
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    if (file.size > MAX_MB * 1024 * 1024) {
      setState({
        kind: "error",
        message: `This file is larger than ${MAX_MB} MB. Try a smaller export.`,
      });
      return;
    }

    setState({ kind: "uploading", progress: 0 });

    try {
      const body = new FormData();
      body.append("file", file);

      // Use XHR so we can surface upload progress.
      const result = await new Promise<{
        uploadId: string;
        redirect: string;
        totalRows: number;
      }>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/uploads");
        xhr.upload.onprogress = (ev) => {
          if (ev.lengthComputable) {
            setState({
              kind: "uploading",
              progress: Math.round((ev.loaded / ev.total) * 100),
            });
          }
        };
        xhr.onload = () => {
          try {
            const json = JSON.parse(xhr.responseText);
            if (xhr.status >= 200 && xhr.status < 300) resolve(json);
            else reject(new Error(json?.error ?? "We had trouble reading this file."));
          } catch {
            reject(new Error("We had trouble reading this file."));
          }
        };
        xhr.onerror = () =>
          reject(new Error("We lost the connection while uploading your file."));
        xhr.send(body);
      });

      setState({
        kind: "success",
        rows: result.totalRows,
        redirect: result.redirect,
      });
      // Give the user a beat to see the success toast, then jump to mapping.
      setTimeout(() => router.push(result.redirect), 900);
    } catch (err) {
      setState({
        kind: "error",
        message: err instanceof Error ? err.message : "Something went wrong.",
      });
    }
  }

  const uploading = state.kind === "uploading";
  const success = state.kind === "success";

  return (
    <div className="space-y-5">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!uploading) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (uploading) return;
          const f = e.dataTransfer.files?.[0];
          if (f) void upload(f);
        }}
        className={cn(
          "group relative overflow-hidden rounded-3xl border-2 border-dashed bg-white p-10 text-center transition-all",
          dragging
            ? "border-brand-500 bg-brand-50/40 shadow-glow"
            : uploading
            ? "border-brand-300 bg-brand-50/20"
            : success
            ? "border-emerald-300 bg-emerald-50/40"
            : "border-border hover:border-brand-300 hover:bg-brand-50/20"
        )}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-brand-100/40 to-transparent opacity-60 transition-opacity group-hover:opacity-100" />
        <div className="relative mx-auto flex max-w-md flex-col items-center">
          <span
            className={cn(
              "inline-flex h-14 w-14 items-center justify-center rounded-2xl ring-1",
              success
                ? "bg-emerald-100 text-emerald-700 ring-emerald-200"
                : "bg-brand-100 text-brand-700 ring-brand-200"
            )}
          >
            {uploading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : success ? (
              <CheckCircle2 className="h-6 w-6" />
            ) : (
              <UploadCloud className="h-6 w-6" />
            )}
          </span>

          <h3 className="mt-5 font-display text-lg font-semibold tracking-tight">
            {uploading
              ? "Reading your file…"
              : success
              ? "Got it — building your mapping"
              : "Drag & drop a file, or click to browse"}
          </h3>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {uploading ? (
              <>We're parsing your columns — this takes a few seconds.</>
            ) : success && state.kind === "success" ? (
              <>We read {state.rows.toLocaleString()} rows. Sending you to mapping…</>
            ) : (
              <>
                We support <strong>CSV</strong> and <strong>Excel</strong> up to {MAX_MB} MB.
                We'll parse it and suggest a clean column mapping.
              </>
            )}
          </p>

          {uploading && state.kind === "uploading" && (
            <div className="mt-5 w-full max-w-xs">
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-brand-500 transition-[width]"
                  style={{ width: `${state.progress}%` }}
                />
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                {state.progress}%
              </div>
            </div>
          )}

          {!uploading && !success && (
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              <Button onClick={() => inputRef.current?.click()}>
                Choose a file
              </Button>
              <Button variant="secondary" asChild>
                <a href="/dashboard/mapping">See demo mapping</a>
              </Button>
            </div>
          )}

          <input
            ref={inputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void upload(f);
            }}
          />
        </div>
      </div>

      {state.kind === "error" && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50/70 px-4 py-3 text-sm text-red-800"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <div className="font-medium">{state.message}</div>
            <div className="mt-0.5 text-xs text-red-700/80">
              If you keep seeing this, try a different file or export.
            </div>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-border/70 bg-white p-5">
        <div className="flex items-center gap-2 text-sm font-medium">
          <FileText className="h-4 w-4 text-brand-700" />
          Try a sample file
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Want to see what happens? These are baked into the demo — wiring them
          up to real fixtures comes in Phase 3.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {samples.map((s) => (
            <button
              key={s.file}
              disabled
              className="group flex cursor-not-allowed flex-col items-start gap-2 rounded-xl border border-border/70 bg-muted/30 p-4 text-left opacity-80"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white text-brand-700 ring-1 ring-brand-100 shadow-soft">
                <s.icon className="h-4 w-4" />
              </span>
              <div className="text-sm font-medium">{s.label}</div>
              <div className="text-xs text-muted-foreground">
                {s.description}
              </div>
              <div className="mt-1 text-[11px] text-muted-foreground">
                Coming soon
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-brand-100 bg-brand-50/60 p-5 text-sm leading-relaxed text-brand-900">
        <strong>What happens next:</strong> We'll read your file, save it to your
        workspace, and suggest how to map your columns. You'll review the
        mapping once — after that, next upload is basically 1-click.
      </div>
    </div>
  );
}
