import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import type { TopProduct } from "@/lib/sample-data";
import { cn, formatCurrency, formatNumber } from "@/lib/utils";

export function TopProductsTable({ products }: { products: TopProduct[] }) {
  const maxRev = Math.max(...products.map((p) => p.revenue));
  return (
    <div className="overflow-hidden rounded-2xl border border-border/70">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/70 bg-muted/40 text-left">
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Product
            </th>
            <th className="hidden px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:table-cell">
              Category
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Revenue
            </th>
            <th className="hidden px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:table-cell">
              Units
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Trend
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/70 bg-white">
          {products.map((p) => {
            const widthPct = (p.revenue / maxRev) * 100;
            const up = p.trend >= 0;
            return (
              <tr key={p.id} className="transition-colors hover:bg-muted/20">
                <td className="px-4 py-3">
                  <div className="font-medium text-foreground">{p.name}</div>
                  <div className="text-xs text-muted-foreground">{p.sku}</div>
                  <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-muted sm:hidden">
                    <div
                      className="h-full rounded-full bg-brand-500/70"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </td>
                <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                  {p.category}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="font-medium tabular-nums">
                    {formatCurrency(p.revenue)}
                  </div>
                  <div className="mt-1 hidden h-1 w-24 overflow-hidden rounded-full bg-muted sm:ml-auto sm:block">
                    <div
                      className="h-full rounded-full bg-brand-500/70"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </td>
                <td className="hidden px-4 py-3 text-right tabular-nums text-muted-foreground sm:table-cell">
                  {formatNumber(p.units)}
                </td>
                <td className="px-4 py-3 text-right">
                  <span
                    className={cn(
                      "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1",
                      up
                        ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
                        : "bg-red-50 text-red-700 ring-red-100"
                    )}
                  >
                    {up ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                    {Math.abs(p.trend).toFixed(1)}%
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
