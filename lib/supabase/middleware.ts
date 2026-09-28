import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refreshes the Supabase auth session on every request and gates the
 * CV builder behind real accounts.
 *
 * opportunity.com intentionally has NO anonymous-session fallback: unlike
 * talentmaroc, a signed-out visitor hitting /cv/* is redirected to /login
 * rather than being silently signed in as an anonymous user.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const requiresAuth = path.startsWith("/cv/") || path === "/cv";
  const isBuilderListRoot = path === "/cv"; // /cv itself renders its own landing state; only /cv/:id is hard-gated
  const isProtectedBuilderPage = requiresAuth && !isBuilderListRoot;

  if (!user && isProtectedBuilderPage) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("next", path);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}
