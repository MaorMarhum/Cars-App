import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth"; // ✅ your existing NextAuth setup

export async function middleware(req: NextRequest) {
  const session = await auth();
  const { pathname } = req.nextUrl;

  // ✅ Protected routes (require authentication)
  const protectedPaths = ["/car", "/account"];

  // Check if the request path starts with any protected route
  const isProtected = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );

  if (isProtected && !session) {
    const restrictedUrl = new URL("/restricted", req.url);
    return NextResponse.redirect(restrictedUrl);
  }

  // ✅ Continue normally if authenticated or not a protected route
  return NextResponse.next();
}

// ✅ Apply middleware only to relevant routes
export const config = {
  matcher: ["/car/:path*", "/account/:path*"],
};
