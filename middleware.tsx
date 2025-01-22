import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicPaths = ["/login", "/signup", "/signup-form", "/forgot-password"];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    
    const path = req.nextUrl.pathname;
    
    if (!session && !publicPaths.includes(path)) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    
    return res;
  } catch (error) {
    console.error("Middleware error:", error);
    return res;
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
