'use server'

import { auth } from '@/lib/auth/server'
import { redirect } from 'next/navigation'

export async function signInAction(prevState, formData) {
  const email = formData.get('email')
  const password = formData.get('password')

  try {
    await auth.signIn.email({ email, password })
  } catch (error) {
    return { error: error.message }
  }

  redirect('/recipes')
}