'use server'

import { auth } from '@/lib/auth/server'
import { redirect } from 'next/navigation'

export async function signInAction(prevState, formData) {
  const email = formData.get('email')
  const password = formData.get('password')

  try {
    const { error } = await auth.signIn.email({ email, password })
    if (error) {
      return { error: error.message }
    }
  } catch (error) {
    return { error: error.message }
  }

  redirect('/recipes')
}

export async function signUpAction(prevState, formData) {
  const name = formData.get('name')
  const email = formData.get('email')
  const password = formData.get('password')

  try {
    const { error } = await auth.signUp.email({ name, email, password })
    if (error) {
      return { error: error.message }
    }
  } catch (error) {
    return { error: error.message }
  }

  redirect('/recipes')
}

export async function signOutAction() {
  await auth.signOut()
  redirect('/')
}