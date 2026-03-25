import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/yonetici', '/api/auth']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public sayfaları geç
  if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Oturum cookie'sini kontrol et
  const session = request.cookies.get('auth_session')
  if (!session?.value) {
    return NextResponse.redirect(new URL('/yonetici', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}