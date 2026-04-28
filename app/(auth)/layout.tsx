import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { ArrowLeft } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-background">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] bg-grid-soft [background-size:32px_32px] mask-fade-b" />
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[380px] w-[680px] -translate-x-1/2 rounded-full bg-brand-200/30 blur-3xl" />

      <div className="mx-auto flex min-h-screen max-w-[1200px] flex-col px-5 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between py-6">
          <Logo />
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>
        </header>
        <main className="flex flex-1 items-center justify-center py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
