import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/env";

/**
 * Routes that are always public. Middleware must return immediately
 * for these — no Supabase client, no session refresh, no redirects.
 * This guarantees the public marketing surface and the public /demo
 * experience stay reachable regardless of session state.
 */
const PUBLIC_EXACT = new Set<string>(["/", "/request-dashboard"]);
const PUBLIC_PREFIXES = ["/demo"]; // covers /demo and /demo/*

function isAlwaysPublic(pathname: string): boolean {
  if (PUBLIC_EXACT.has(pathname)) return true;
  for (const p of PUBLIC_PREFIXES) {
    if (pathname === p || pathname.startsWith(`${p}/`)) return true;
  }
  return false;
}

/**
 * Refresh the Supabase session on every request and enforce auth for
 * protected routes. Called from the project-root `middleware.ts`.
 *
 * Routing policy:
 *   - Public routes ("/", "/demo", "/demo/*")  → pass through, no auth work.
 *   - Protected routes ("/dashboard/*", "/api/uploads/*") → require a user.
 *   - Auth routes ("/login", "/signup") → redirect to /dashboard if already signed in.
 *   - Everything else → session refresh only.
 */
export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Hard bypass for public pages — never redirect these, never touch Supabase.
  if (isAlwaysPublic(pathname)) {
    return NextResponse.next({ request: { headers: request.headers } });
  }

  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        request.cookies.set({ name, value, ...options });
        response = NextResponse.next({ request: { headers: request.headers } });
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({ name, value: "", ...options });
        response = NextResponse.next({ request: { headers: request.headers } });
        response.cookies.set({ name, value: "", ...options });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthRoute = pathname === "/login" || pathname === "/signup";
  const isProtectedRoute =
    pathname.startsWith("/dashboard") || pathname.startsWith("/api/uploads");

  if (!user && isProtectedRoute) {
    const redirect = request.nextUrl.clone();
    redirect.pathname = "/login";
    redirect.searchParams.set("next", pathname);
    return NextResponse.redirect(redirect);
  }

  if (user && isAuthRoute) {
    const redirect = request.nextUrl.clone();
    redirect.pathname = "/dashboard";
    redirect.search = "";
    return NextResponse.redirect(redirect);
  }

  return response;
}
