// src/app/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';

export function middleware(request: NextRequest) {
  // Check if the user is accessing a protected route
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    // Get the token from cookies or localStorage
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      // No token, redirect to login
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    
    try {
      // Verify token and check approval status
      const decoded: any = jwtDecode(token);
      
      // If not approved, redirect to pending approval
      if (!decoded.isApproved) {
        return NextResponse.redirect(new URL('/auth/pending-approval', request.url));
      }
      
    } catch (error) {
      // Invalid token, redirect to login
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};