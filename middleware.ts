import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Run on every request EXCEPT:
     *   - Next internals (_next/static, _next/image)
     *   - favicon
     *   - static asset file extensions
     *   - the public /demo experience (so it can never redirect to /login)
     *
     * /demo and /demo/* are always publicly accessible.
     */
    "/((?!_next/static|_next/image|favicon.ico|demo(?:/.*)?$|request-dashboard$|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
