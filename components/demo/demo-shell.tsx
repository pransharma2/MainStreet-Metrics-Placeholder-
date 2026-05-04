import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/**
 * Unauthenticated shell for the public /demo routes.
 * Intentionally separate from DashboardShell so it never touches
 * the auth context or server-only session helpers.
 */
export function DemoShell({
  children,
  title,
  description,
  backHref,
  backLabel,
}: {
  children: React.ReactNode;
  title?: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <div className="min-h-screen bg-muted/20">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-3">
            <Link href="/" aria-label="MainStreet Metrics home">
              <Logo size="sm" />
            </Link>
            <Badge variant="warm" className="hidden sm:inline-flex">
              Live demo
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/demo">All demos</Link>
            </Button>
            <Button asChild variant="secondary" size="sm" className="hidden sm:inline-flex">
              <Link href="/signup">Try with your own file</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/signup">Start free</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-6 sm:px-8 sm:py-8">
        {(title || description || backHref) && (
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div className="min-w-0">
              {backHref && (
                <Link
                  href={backHref}
                  className="inline-flex text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  ← {backLabel ?? "Back"}
                </Link>
              )}
              {title && (
                <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                  {title}
                </h1>
              )}
              {description && (
                <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                  {description}
                </p>
              )}
            </div>
          </div>
        )}

        {children}
      </div>
    </div>
  );
}
