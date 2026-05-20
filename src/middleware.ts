import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const auth = request.cookies.get('auth')?.value

  if (!auth && !request.nextUrl.pathname.startsWith('/login') && !request.nextUrl.pathname.startsWith('/_next') && !request.nextUrl.pathname.startsWith('/public')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (auth && request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|manifest.json|sw.js|icon|.*\\.png$).*)'],
}
