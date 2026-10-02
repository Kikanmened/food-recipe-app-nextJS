import { createNeonAuth } from '@neondatabase/auth/next/server'
import { parseSetCookies } from '@neondatabase/auth/server'
import { cookies, headers } from 'next/headers'

function createAuth() {
  const secret = process.env.NEON_AUTH_COOKIE_SECRET
  const baseUrl = process.env.NEON_AUTH_BASE_URL

  if (!baseUrl || !secret) {
    throw new Error(
      'NEON_AUTH_BASE_URL and NEON_AUTH_COOKIE_SECRET must be set'
    )
  }

  return createNeonAuth({
    baseUrl,
    cookies: {
      secret,
      sameSite: 'lax',
    },
  })
}

let authInstance

export function getAuth() {
  if (!authInstance) {
    authInstance = createAuth()
  }

  return authInstance
}

export const auth = new Proxy(
  {},
  {
    get(_target, prop) {
      const value = getAuth()[prop]
      return typeof value === 'function' ? value.bind(getAuth()) : value
    },
  }
)

export async function getCurrentUser() {
  const requestHeaders = await headers()
  const protocol = requestHeaders.get('x-forwarded-proto') === 'http' ? 'http' : 'https'
  const host = requestHeaders.get('host') || 'localhost'
  const request = new Request(`${protocol}://${host}/api/auth/get-session`, {
    method: 'GET',
    headers: requestHeaders,
  })

  // Use the same verified session and cookie refresh path as authClient.useSession().
  const response = await getAuth().handler().GET(request, {
    params: Promise.resolve({ path: ['get-session'] }),
  })

  const cookieStore = await cookies()
  for (const header of response.headers.getSetCookie()) {
    for (const cookie of parseSetCookies(header)) {
      cookieStore.set(cookie)
    }
  }

  if (response.status === 401) return null
  if (!response.ok) {
    throw new Error('Unable to verify your session. Please try again.')
  }

  const session = await response.json()
  return session?.user ?? null
}
