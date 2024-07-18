import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  console.log("middleware......XXX");
  return Response.redirect(new URL("/login", request.url));
  const currentUser = request.cookies.get("currentUser")?.value;

  if (currentUser) {
    return Response.redirect(new URL("/login", request.url));
  }

  if (currentUser && !request.nextUrl.pathname.startsWith("/dashboard")) {
    return Response.redirect(new URL("/dashboard", request.url));
  }

  if (!currentUser && !request.nextUrl.pathname.startsWith("/login")) {
    return Response.redirect(new URL("/login", request.url));
  }
}

export const configXXX = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};

export const config = {
  matcher: ["/about/:path*", "/*"],
};
