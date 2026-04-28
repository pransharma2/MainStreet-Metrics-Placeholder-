import Link from "next/link";
import { Logo } from "@/components/brand/logo";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-5 py-14 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="lg:col-span-2">
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Clean, business-ready dashboards for the people who run Main Street.
            No SQL, no jargon, no data team required.
          </p>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-foreground">
            Product
          </div>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="#how-it-works" className="hover:text-foreground">
                How it works
              </Link>
            </li>
            <li>
              <Link href="#what-you-get" className="hover:text-foreground">
                What you get
              </Link>
            </li>
            <li>
              <Link href="#pricing" className="hover:text-foreground">
                Pricing
              </Link>
            </li>
            <li>
              <Link href="/dashboard" className="hover:text-foreground">
                Demo dashboard
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-foreground">
            Company
          </div>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>About</li>
            <li>Privacy</li>
            <li>Terms</li>
            <li>
              <a href="mailto:hello@mainstreetmetrics.app" className="hover:text-foreground">
                hello@mainstreetmetrics.app
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-2 px-5 py-5 text-xs text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <span>© {new Date().getFullYear()} MainStreet Metrics.</span>
          <span>Made for small shops, cafés, and makers.</span>
        </div>
      </div>
    </footer>
  );
}
