import { getAuth } from '@/lib/auth/server'
import { NEON_AUTH_SESSION_COOKIE_NAME, NEON_AUTH_SESSION_DATA_COOKIE_NAME } from '@neondatabase/auth/server'
import { NextResponse } from 'next/server'

function withPathAlias(handler) {
  return async (request, context) => {
    const params = await context.params
    return handler(request, {
      ...context,
      params: Promise.resolve({
        path: params.path || params.all || [],
      }),
    })
  }
}

export async function GET(request, context) {
  const { GET: handleGet } = getAuth().handler()
  return withPathAlias(handleGet)(request, context)
}

export async function POST(request, context) {
  const { POST: handlePost } = getAuth().handler()
  const response = await withPathAlias(handlePost)(request, context)
  const params = await context.params
  const path = params.path || params.all || []

  if (path.join('/') !== 'sign-out' || !response.ok) return response

  // Expire both the session token and the local signed cache on this app's host.
  const signedOutResponse = new NextResponse(response.body, {
    status: response.status,
    headers: response.headers,
  })
  for (const name of [NEON_AUTH_SESSION_COOKIE_NAME, NEON_AUTH_SESSION_DATA_COOKIE_NAME]) {
    signedOutResponse.cookies.set(name, '', {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 0,
    })
  }
  return signedOutResponse
}
