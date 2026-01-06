import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware";

export default withAuth(async function middleware() {}, {
  // Middleware still runs on all routes, but doesn't protect the blog route
  publicPaths: [
    "/",
    "/embed-chat",
    "/api/upstash/trigger",
    "/api/workflow/chat",
  ],
});

// export const config = {
//   matcher: [
//     "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
//   ],
// };

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - embed-chat (Public embed page)
     * - _next (Next.js internals)
     * - All static files (images, css, js, including embed.js)
     */
    "/((?!embed-chat|_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
