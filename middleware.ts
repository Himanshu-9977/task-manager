import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

// Define routes that require authentication
const isProtectedRoute = createRouteMatcher([
  "/", // Home/dashboard
  "/(.*)tasks(.*)", // Any task-related routes
  "/dashboard(.*)", // Any dashboard routes
  "/profile(.*)", // Any profile routes
  "/settings(.*)", // Any settings routes
])

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"])

export default clerkMiddleware(async (auth, req) => {
  // If the route is protected, enforce authentication
  if (isProtectedRoute(req)) {
    await auth.protect()
  }

})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
}

