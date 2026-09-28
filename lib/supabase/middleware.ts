import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refreshes the Supabase auth session on every request and gates the
 * parts of the CV builder that touch a saved account.
 *
 * opportunity.com intentionally has NO anonymous-session fallback: unlike
 * talentmaroc, a signed-out visitor hitting a *saved* CV (/cv/[id]) is
 * redirected to /login rather than being silently signed in as an
 * anonymous user.
 *
 * /cv/builder is the one deliberate exception: it's the anonymous-capable
 * editor. A signed-out visitor can upload a CV or drag a job onto it and
 * land there to edit freely — the CV data lives in the browser only
 * (localStorage), never in Supabase, until they sign in. Auth is only
 * enforced at the point of real value: downloading (which first saves the
 * draft to their account) and its /checkout step.
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
  const isBuilderListRoot  = path === "/cv"; // /cv itself renders its own landing state
  const isAnonymousBuilder = path === "/cv/builder" || path.startsWith("/cv/builder/");
  const requiresAuth = path.startsWith("/cv/") || path === "/cv";
  const isProtectedBuilderPage = requiresAuth && !isBuilderListRoot && !isAnonymousBuilder;

  if (!user && isProtectedBuilderPage) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("next", path);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}
