import { getAuth } from '@/lib/auth/server'

export function middleware(request, event) {
  return getAuth().middleware({ loginUrl: '/sign-in' })(request, event)
}

export const config = {
  matcher: ['/recipes/:path*', '/favorites/:path*'],
}
