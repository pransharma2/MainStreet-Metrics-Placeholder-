"use client";

import { useEffect, useRef, useState } from "react";
import { Info, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DASHBOARD_EXPLANATIONS,
  type ExplanationKey,
} from "@/lib/dashboard-explanations";

type Align = "left" | "right";
type Size = "sm" | "md";

export function ExplanationButton({
  explanationKey,
  align = "left",
  size = "md",
  className,
  label,
}: {
  explanationKey: ExplanationKey;
  align?: Align;
  size?: Size;
  className?: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const exp = DASHBOARD_EXPLANATIONS[explanationKey];
  const triggerSize =
    size === "sm" ? "h-5 w-5" : "h-6 w-6";
  const iconSize = size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5";

  return (
    <div ref={ref} className={cn("relative inline-flex shrink-0", className)}>
      <button
        type="button"
        aria-label={label ?? `What does ${exp.title} mean?`}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex items-center justify-center rounded-full text-muted-foreground/80 transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70",
          triggerSize
        )}
      >
        <Info className={iconSize} />
      </button>
      {open && (
        <div
          role="dialog"
          aria-label={exp.title}
          className={cn(
            "absolute z-30 top-full mt-2 w-[280px] rounded-2xl border border-border/70 bg-white p-4 text-left shadow-card sm:w-[320px]",
            align === "right" ? "right-0" : "left-0"
          )}
        >
          <div className="mb-2 flex items-start justify-between gap-3">
            <div className="text-sm font-semibold tracking-tight text-foreground">
              {exp.title}
            </div>
            <button
              type="button"
              aria-label="Close"
              onClick={() => setOpen(false)}
              className="-m-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <dl className="space-y-2.5 text-xs leading-relaxed">
            <div>
              <dt className="font-medium text-foreground">What this means</dt>
              <dd className="mt-0.5 text-muted-foreground">{exp.what}</dd>
            </div>
            <div>
              <dt className="font-medium text-foreground">Why it matters</dt>
              <dd className="mt-0.5 text-muted-foreground">{exp.why}</dd>
            </div>
            <div>
              <dt className="font-medium text-foreground">Suggested next step</dt>
              <dd className="mt-0.5 text-muted-foreground">{exp.next}</dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  );
}
