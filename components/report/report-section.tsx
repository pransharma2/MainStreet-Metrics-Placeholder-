import { cn } from "@/lib/utils";

export function ReportSection({
  number,
  title,
  description,
  children,
  className,
}: {
  number?: number;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "report-section break-inside-avoid rounded-3xl border border-border/70 bg-white p-6 shadow-soft sm:p-8",
        className
      )}
    >
      <div className="mb-5 flex items-start gap-4 sm:mb-6">
        {typeof number === "number" && (
          <span className="report-section-number inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 font-display text-base font-semibold text-brand-800 ring-1 ring-brand-100">
            {number}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-xl font-semibold tracking-tight sm:text-2xl">
            {title}
          </h2>
          {description && (
            <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </div>
      <div>{children}</div>
    </section>
  );
}
