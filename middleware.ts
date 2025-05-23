import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  // "/(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // If the route isn't public and user is not signed in
  // if (!isPublicRoute(req)) {
  //   // Redirect to sign-in if not authenticated
  //   if (!userId) {
  //     return redirect("/sign-in");
  //   }

  //   // Otherwise protect the route
  //   await auth.protect();
  // }

  // if (!isPublicRoute(req)) {
  //   // Add custom logic to run before redirecting

  //   return redirect("https://app.casebeam.ai/sign-in");
  // }

  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
