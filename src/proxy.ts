import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define public routes that don't require authentication [cite: 4]
const isPublicRoute = createRouteMatcher([
    '/sign-in(.*)',
    '/api/:path'
]);

// Define routes restricted to Doctors [cite: 4]
const isNewsStatusUpdateRoute = createRouteMatcher([
  "/api/news/:newsId/status"
]);

// Define routes restricted to Admins [cite: 4]
const isAdminRoute = createRouteMatcher([
  '/user',
  '/api/staff/admin',
  'api/staff/role-request/:requestId'
])

export default clerkMiddleware(async (auth, req) => {
    // Protect all routes except public ones [cite: 4]
    if (!isPublicRoute(req)) {
        await auth.protect();
    }

    // Role-based access for News status updates (Doctors only) [cite: 4]
    if (isNewsStatusUpdateRoute(req)) {
      const session = await auth();
      const role = session.sessionClaims?.metadata?.title;

      if (role !== "Doctor") {
        return NextResponse.json(
          { error: "Forbidden: Doctors only" },
          { status: 403 }
        );
      }
    }

    // Role-based access for Admin panel and role requests (Admins only) [cite: 4]
    if (isAdminRoute(req)) {
      const session = await auth();
      const role = session.sessionClaims?.metadata?.title;

      if (role !== "Admin") {
        return NextResponse.json(
          { error: "Forbidden: Admins only" },
          { status: 403 }
        )
      }
    }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files [cite: 4]
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes [cite: 4]
    '/(api|trpc)(.*)',
  ],
};