import { Sparkles } from "lucide-react";
import Link from "next/link";

export function Logo({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const textSize =
    size === "lg" ? "text-xl" : size === "sm" ? "text-sm" : "text-base";
  const dotSize =
    size === "lg" ? "h-9 w-9" : size === "sm" ? "h-7 w-7" : "h-8 w-8";

  return (
    <Link
      href="/"
      className={`group inline-flex items-center gap-2.5 ${className ?? ""}`}
    >
      <span
        className={`relative inline-flex ${dotSize} items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 text-white shadow-[0_6px_16px_-6px_rgba(5,150,105,0.8)] ring-1 ring-inset ring-white/20 transition-transform group-hover:-rotate-3`}
      >
        <Sparkles className="h-4 w-4" strokeWidth={2.5} />
        <span className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-tr from-white/20 to-transparent" />
      </span>
      <span
        className={`${textSize} font-semibold tracking-tight text-foreground`}
      >
        MainStreet <span className="text-brand-700">Metrics</span>
      </span>
    </Link>
  );
}
