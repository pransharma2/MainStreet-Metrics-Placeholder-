"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTransition } from "react";
import {
  LayoutDashboard,
  UploadCloud,
  Sparkles,
  ShieldCheck,
  Settings,
  LifeBuoy,
  ChevronDown,
  LogOut,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";
import { useActiveSession } from "@/components/dashboard/dashboard-shell-context";
import { logoutAction } from "@/app/(auth)/actions";
import { getInitials } from "@/lib/workspace";

const primary = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/upload", label: "Uploads", icon: UploadCloud },
  { href: "/dashboard/mapping", label: "Column mapping", icon: Sparkles },
  { href: "/dashboard/data-quality", label: "File check", icon: ShieldCheck },
];

const secondary = [
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
  { href: "#", label: "Help & docs", icon: LifeBuoy },
];

function businessInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function DashboardShell({
  children,
  title,
  description,
  actions,
}: {
  children: React.ReactNode;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  const pathname = usePathname();
  const session = useActiveSession();
  const [loggingOut, startLogout] = useTransition();

  const displayName =
    session.user.profile?.full_name?.trim() ||
    session.user.email?.split("@")[0] ||
    "there";

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden w-[260px] shrink-0 border-r border-border/60 bg-white lg:flex lg:flex-col">
          <div className="flex h-16 items-center border-b border-border/60 px-5">
            <Logo size="sm" />
          </div>

          <div className="px-3 py-4">
            <button className="flex w-full items-center justify-between rounded-xl border border-border/70 bg-muted/40 px-3 py-2.5 text-left transition-colors hover:bg-muted">
              <div className="flex items-center gap-2.5">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-warm-100 text-warm-800 text-xs font-semibold ring-1 ring-warm-200">
                  {businessInitials(session.business.name)}
                </span>
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">
                    {session.business.name}
                  </div>
                  <div className="truncate text-[11px] text-muted-foreground">
                    {session.business.industry ?? "Small business"}
                  </div>
                </div>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          <nav className="flex-1 space-y-0.5 px-3">
            {primary.map((item) => {
              const active =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                    active
                      ? "bg-brand-50 text-brand-800 font-medium"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-4 w-4",
                      active ? "text-brand-700" : "text-muted-foreground"
                    )}
                  />
                  {item.label}
                </Link>
              );
            })}

            <div className="mt-6 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
              Workspace
            </div>
            {secondary.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
            <button
              onClick={() => startLogout(() => logoutAction())}
              disabled={loggingOut}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              {loggingOut ? "Signing out…" : "Sign out"}
            </button>
          </nav>

          <div className="m-3 rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50 to-white p-4">
            <div className="text-xs font-semibold text-brand-800">
              You're on the free beta
            </div>
            <p className="mt-1 text-xs leading-relaxed text-brand-800/80">
              Unlimited uploads and automatic monthly refresh are coming soon.
            </p>
            <Link
              href="/#pricing"
              className="mt-3 inline-flex text-xs font-medium text-brand-700 hover:underline"
            >
              See plans →
            </Link>
          </div>
        </aside>

        {/* Main column */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Topbar */}
          <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur">
            <div className="flex h-16 items-center justify-between px-5 sm:px-8">
              <div className="min-w-0">
                {title && (
                  <h1 className="truncate font-display text-xl font-semibold tracking-tight">
                    {title}
                  </h1>
                )}
                {description && (
                  <p className="truncate text-xs text-muted-foreground">
                    {description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {actions}
                <div
                  title={session.user.email ?? undefined}
                  className="hidden items-center gap-2 rounded-full border border-border/70 bg-white py-1 pl-1 pr-3 text-sm shadow-soft sm:flex"
                >
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-800">
                    {getInitials(
                      session.user.profile?.full_name,
                      session.user.email
                    )}
                  </span>
                  <span className="max-w-[140px] truncate text-foreground">
                    {displayName}
                  </span>
                </div>
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 px-5 py-6 sm:px-8 sm:py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
