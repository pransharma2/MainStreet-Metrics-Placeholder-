import Link from "next/link";
import { ShieldCheck, AlertTriangle, Info, CircleAlert } from "lucide-react";
import type { DataQualityItem } from "@/lib/sample-data";
import { cn } from "@/lib/utils";

const iconMap = {
  success: ShieldCheck,
  warning: AlertTriangle,
  info: Info,
  error: CircleAlert,
};

const toneMap = {
  success: "text-emerald-700 bg-emerald-50 ring-emerald-100",
  warning: "text-amber-700 bg-amber-50 ring-amber-100",
  info: "text-sky-700 bg-sky-50 ring-sky-100",
  error: "text-red-700 bg-red-50 ring-red-100",
};

export function DataQualityCard({
  items,
  compact,
}: {
  items: DataQualityItem[];
  compact?: boolean;
}) {
  const list = compact ? items.slice(0, 3) : items;
  return (
    <div className="space-y-3">
      <ul className="space-y-2.5">
        {list.map((it) => {
          const Icon = iconMap[it.severity];
          return (
            <li
              key={it.id}
              className="flex items-start gap-3 rounded-xl border border-border/70 bg-white p-3"
            >
              <span
                className={cn(
                  "mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-lg ring-1",
                  toneMap[it.severity]
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <div className="text-sm font-medium text-foreground">
                  {it.title}
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {it.body}
                </div>
                {it.fix && (
                  <div className="mt-1 text-xs text-brand-700">{it.fix}</div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      {compact && items.length > list.length && (
        <Link
          href="/dashboard/data-quality"
          className="inline-flex text-xs font-medium text-brand-700 hover:underline"
        >
          View the full file check →
        </Link>
      )}
    </div>
  );
}
