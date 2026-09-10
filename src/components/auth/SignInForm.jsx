'use client'

import { useActionState } from 'react'
import { signInAction } from '@/app/actions/auth'

export default function SignInForm() {
  const [state, formAction, isPending] = useActionState(signInAction, {
    error: undefined,
  })

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="input input-bordered w-full"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="input input-bordered w-full"
        />
      </div>

      {state?.error && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="btn btn-primary w-full"
      >
        {isPending ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  )
}