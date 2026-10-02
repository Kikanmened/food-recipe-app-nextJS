import { headers } from 'next/headers'
import { createNeonAuth } from '@neondatabase/auth/next/server'

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
  const authInstance = getAuth()

  let result
  try {
    result = await authInstance.getSession({ headers: requestHeaders })
  } catch {
    result = await authInstance.getSession()
  }

  const session = result?.data ?? result
  return session?.user ?? null
}
