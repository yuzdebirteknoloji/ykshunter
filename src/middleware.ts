import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Public routes (giriş yapmadan erişilebilir)
  const publicRoutes = ['/login', '/api/auth/login', '/api/auth/register']
  
  // Public route ise devam et
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }
  
  // Session cookie'sini kontrol et
  const session = request.cookies.get('session')
  
  // Session yoksa login'e yönlendir
  if (!session) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }
  
  // Session varsa devam et
  return NextResponse.next()
}

// Middleware'in çalışacağı route'lar
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
