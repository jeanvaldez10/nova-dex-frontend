import { NextRequest, NextResponse } from "next/server";

export default async function middleware(req: NextRequest, res: NextResponse) {
  const pathname = req.nextUrl.pathname;
  const session = req.cookies.get("_nova_session");
  const isNew = req.cookies.get("isNew")?.value === "true";

  const unprotectedRoutes = ["/login"];

  const response = NextResponse.next();

  // if (pathname.includes("/token")) {
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate",
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
    response.headers.set("Surrogate-Control", "no-store");

    // Prevent browsers from caching the page
    response.headers.set("Clear-Site-Data", '"cache", "storage"');
  // }

  if (isNew) {
    // Check if the user is coming from the login page
    if (pathname === "/login") {
      return NextResponse.next();
    }

    // If the user is new and not on the login page, redirect to login
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (pathname === "/login" && session) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // If user is already logged in and trying to access login page, redirect to home
  if (session && pathname === "/login" && !isNew) {
    // Check if there's a destination param to redirect to
    // if (!req.nextUrl.searchParams.has("d")) {
    //   const destination = req.nextUrl.searchParams.get("d") || "/";
    //   return NextResponse.redirect(new URL(destination, req.url));
    // }
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Allow access to unprotected routes
  if (unprotectedRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Redirect to login if no session
  if (!session) {
    // if (!req.nextUrl.searchParams.has("d")) {
    //   return NextResponse.redirect(
    //     new URL(`/login?d=${req.nextUrl.searchParams.get("d")}`, req.url),
    //   );
    // }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.*\\.).*)"],
};
