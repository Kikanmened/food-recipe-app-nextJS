'use client'

import { createAuthClient } from '@neondatabase/auth/next'

export const authClient = createAuthClient()

export async function signOutAndRedirect() {
  const { error } = await authClient.signOut()
  if (error) {
    throw new Error('Unable to sign out. Please try again.')
  }

  try {
    window.localStorage.removeItem('recipe-book-favorites')
  } catch {
    // Storage can be blocked; it must not prevent a successful logout.
  }

  window.location.replace('/sign-in')
}
