"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BuildDashboardButton({
  uploadId,
  size = "default",
  label = "Build my dashboard",
}: {
  uploadId: string;
  size?: "default" | "sm" | "lg";
  label?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState<"idle" | "cleaning" | "building">("idle");

  function onClick() {
    setError(null);
    startTransition(async () => {
      try {
        setStage("cleaning");
        // Small visual step so users see progress even if processing is fast.
        await new Promise((r) => setTimeout(r, 150));
        setStage("building");
        const res = await fetch(`/api/uploads/${uploadId}/process`, {
          method: "POST",
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(
            data?.error ??
              "We couldn't build your dashboard from this file. Please try again."
          );
        }
        router.push(data?.redirect ?? "/dashboard");
      } catch (err) {
        setStage("idle");
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <Button size={size} onClick={onClick} disabled={pending}>
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
        {pending
          ? stage === "cleaning"
            ? "Cleaning your sales file…"
            : "Building your dashboard…"
          : label}
      </Button>
      {error && (
        <div
          role="alert"
          className="flex max-w-sm items-start gap-2 rounded-xl border border-red-200 bg-red-50/80 px-3 py-2 text-xs text-red-800"
        >
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
