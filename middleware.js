import { NextResponse } from 'next/server'
import { getAuth } from '@/lib/auth/server'

export function middleware(request, event) {
  if (request.headers.has('Next-Action')) {
    return NextResponse.next()
  }

  return getAuth().middleware({ loginUrl: '/sign-in' })(request, event)
}

export const config = {
  matcher: ['/favorites/:path*'],
}
