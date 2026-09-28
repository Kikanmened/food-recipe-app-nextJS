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
