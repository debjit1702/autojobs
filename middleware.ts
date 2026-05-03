import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // If authenticated but setup not complete, redirect to setup
    // (only for non-setup routes)
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    if (
      token &&
      !token.setupCompleted &&
      !path.startsWith("/setup") &&
      !path.startsWith("/api")
    ) {
      return NextResponse.redirect(new URL("/setup", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Allow the middleware function to run only when authorized
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        // These paths require auth
        if (
          path.startsWith("/dashboard") ||
          path.startsWith("/setup") ||
          path.startsWith("/scan") ||
          path.startsWith("/profile") ||
          path.startsWith("/tracker") ||
          path.startsWith("/scans")
        ) {
          return !!token;
        }
        return true;
      },
    },
    pages: {
      signIn: "/",
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/setup/:path*",
    "/scan/:path*",
    "/scans/:path*",
    "/profile/:path*",
    "/tracker/:path*",
  ],
};
