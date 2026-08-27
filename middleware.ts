import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { resolveSubdomain, normalizeRootDomain } from "@/lib/utils/domain";
import { SITE_SLUG_HEADER } from "@/lib/site/current-site";

const PUBLIC_PREFIX = "/site";

/**
 * app/page.tsx (root portal placeholder) and app/site/page.tsx (a club's
 * public home) both want to answer "/", depending on which host the
 * request came in on. Next.js resolves routes purely from the file system,
 * so it can't pick between two files for the same path based on a runtime
 * header — one would silently shadow the other. The fix is to rewrite
 * subdomain requests onto a distinct internal path (/site/...) that has no
 * collision with the root tree. This is invisible to the browser —
 * Links/redirects still use the public "/", "/about" paths; only the
 * internal routing target changes.
 *
 * Admin paths don't need this: there is no root-level "/admin" page to
 * collide with, so app/admin/... resolves directly. It still gets the
 * x-site-slug header like everything else on a subdomain request.
 *
 * robots.txt, rss.xml, and sitemap.xml are the same story — search
 * engines/crawlers fetch them from whatever host they crawled, and a club
 * subdomain has no app/site/robots.txt, app/site/rss.xml, or
 * app/site/sitemap.xml to rewrite onto, so all three must keep resolving to
 * the root app/robots.ts, app/rss.xml, and app/sitemap.ts everywhere.
 */
function rewrittenPathname(pathname: string): string {
  if (
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/robots.txt" ||
    pathname === "/rss.xml" ||
    pathname === "/sitemap.xml"
  ) {
    return pathname;
  }
  return pathname === "/" ? PUBLIC_PREFIX : `${PUBLIC_PREFIX}${pathname}`;
}

export async function middleware(request: NextRequest) {
  const rootDomain = normalizeRootDomain(
    process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "damyangall.kr"
  );
  const subdomain = resolveSubdomain(
    request.headers.get("host") ?? "",
    rootDomain
  );

  if (subdomain) {
    request.headers.set(SITE_SLUG_HEADER, subdomain);
  }

  function buildResponse() {
    if (!subdomain) return NextResponse.next({ request });
    const url = request.nextUrl.clone();
    url.pathname = rewrittenPathname(url.pathname);
    return NextResponse.rewrite(url, { request });
  }

  let response = buildResponse();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    // Supabase project not configured yet — let public/static pages still
    // work during early scaffolding instead of hard-failing every request.
    return response;
  }

  // Refresh the Supabase auth session cookie on every request so server
  // components always see an up-to-date session (per @supabase/ssr's
  // documented middleware pattern) — required for /admin auth to work.
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = buildResponse();
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images|icons|fonts).*)",
  ],
};
