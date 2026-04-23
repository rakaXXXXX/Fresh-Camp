import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password',]

export async function middleware(request) {
  const { pathname, searchParams } = request.nextUrl

  // ✅ Skip assets & API routes
  if (
    pathname.startsWith('/api/') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  const token = await getToken({
    req: request,
  })
    

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname)

  const isAuthFlow =
    searchParams.has('callbackUrl') ||
    searchParams.has('error')

  console.log(
    `[Middleware] Path: ${pathname}, Token: ${!!token}, Public: ${isPublicRoute}`
  )
  console.log("TOKEN:", token)

  // ❌ not logged in → block protected pages
  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // ✅ logged in → prevent manual login access
  if (token && isPublicRoute && !isAuthFlow) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}