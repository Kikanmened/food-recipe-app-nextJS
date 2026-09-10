import { auth } from '@/lib/auth/server'

export const middleware = auth.middleware()

export const config = {
  matcher: ['/recipes/:path*', '/favorites/:path*'],
}