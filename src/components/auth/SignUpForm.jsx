'use client'

import { useActionState } from 'react'
import { signUpAction } from '@/app/actions/auth'

export default function SignUpForm() {
  const [state, formAction, isPending] = useActionState(signUpAction, {
    error: undefined,
  })

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="input input-bordered w-full"
        />
      </div>

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
          minLength={8}
          className="input input-bordered w-full"
        />
      </div>

      {state?.error && (
        <p className="text-sm text-error">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="btn btn-primary w-full"
      >
        {isPending ? 'Creating account...' : 'Sign up'}
      </button>
    </form>
  )
}
