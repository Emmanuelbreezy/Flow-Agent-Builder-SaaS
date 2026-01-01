import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware";

export default withAuth(async function middleware() {}, {
  // Middleware still runs on all routes, but doesn't protect the blog route
  isReturnToCurrentPage: true,
  publicPaths: [
    "/",
    "/api/upstash/trigger",
    "/api/upstash/notify",
    "/api/workflow/6954b742bbc1c2398b8c3d29/chat",
  ],
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
