import { getToken } from "next-auth/jwt";
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  async function middleware(req) {
    // Retrieve the token from the request headers
    const token = await getToken({ req });
    // Check if a token exists
    const isAuthenticated = !!token;
    // Define a list of protected routes that require authentication
    const authRoutes = ["/profile", "/calendar", "/track", "/metrics", "/jobs"];
    // Check if the requested route is in the list of protected routes
    if (authRoutes.includes(req.nextUrl.pathname)) {
      // If the user is authenticated, allow access to the requested route
      if (isAuthenticated) {
        // Check if the user's role is set in the token
        if (!token.userRole) {
          console.log("UserRole is not set, redirecting to onboarding");
          // Redirect the user to the onboarding page if user role is not set
          return NextResponse.redirect(new URL("/onboarding", req.url));
        }
        // If authenticated and user's role is set, allow access to the requested route
        return NextResponse.next();
      } else {
        console.log("User not authenticated, redirecting to login");
        // If the user is not authenticated, redirect them to the login page
        return NextResponse.redirect(new URL("/login", req.url));
      }
    } else {
      // If the requested route is not in the list of protected routes,
      // allow access to the requested route
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
  matcher: ["/profile", "/calendar", "/track", "/metrics", "/jobs"],
};
