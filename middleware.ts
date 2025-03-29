import { getToken } from "next-auth/jwt";
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  async function middleware(req) {
    // Retrieve the token from the request headers
    const token = await getToken({ req });
    // Check if a token exists
    const isAuthenticated = !!token;

    // Define a list of protected route prefixes
    const authRoutes = [
      "/profile",
      "/messages",
      "/calendar",
      "/track",
      "/metrics",
      "/jobs",
    ];

    // Check if the requested route starts with any protected route
    const isProtectedRoute = authRoutes.some((route) =>
      req.nextUrl.pathname.startsWith(route)
    );

    if (isProtectedRoute) {
      // If the user is authenticated, allow access to the requested route
      if (isAuthenticated) {
        // Check if the user's role is set in the token
        if (!token.userRole) {
          // Redirect to onboarding if role is not set
          return NextResponse.redirect(new URL("/onboarding", req.url));
        }

        // If the user's role is client, disable access to the requested route
        if (req.nextUrl.pathname === "/track") {
          if (token.userRole === "CLIENT") {
            // Redirect to profile if role is client
            return NextResponse.redirect(new URL("/profile", req.url));
          }
        }

        // Allow access to protected routes based on authentication
        return NextResponse.next();
      } else {
        // If the user is not authenticated, redirect them to the login page
        return NextResponse.redirect(new URL("/login", req.url));
      }
    }

    // If the requested route is not in the list of protected routes,
    // allow access to the requested route
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true,
    },
  }
);

export const config = {
  matcher: [
    "/profile/:path*",
    "/messages/:path*",
    "/calendar/:path*",
    "/track/:path*",
    "/metrics/:path*",
    "/jobs/:path*",
  ],
};