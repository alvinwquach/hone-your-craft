import { getToken } from "next-auth/jwt";
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  async function middleware(req) {
    // Retrieve the token from the request headers
    const token = await getToken({ req });

    // Check if a token exists
    const isAuthenticated = !!token;

    // Define routes that require authentication
    const authRoutes = [
      "/profile",
      "/calendar",
      "/track",
      "/metrics",
      "/roles",
    ];

    // Check if the requested route is in the list of protected routes
    if (authRoutes.includes(req.nextUrl.pathname)) {
      // If the user is authenticated, allow access to the requested route
      if (isAuthenticated) {
        // Allow access to the requested route
        return NextResponse.next();
      } else {
        // If the user is not authenticated, redirect them to the login page
        return NextResponse.redirect(new URL("/login", req.url));
      }
    } else {
      /* If the requested route is not in the list of protected routes,
      allow access to the requested route */
      return NextResponse.next();
    }
  },
  {
    callbacks: {
      authorized: () => true,
    },
  }
);

export const config = {
  matcher: ["/profile", "/calendar", "/track", "/metrics", "/roles"],
};
