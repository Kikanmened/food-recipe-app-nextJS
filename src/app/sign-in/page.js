import Link from 'next/link'
import { SignInForm } from '@/components/auth'

export const metadata = {
  title: 'Sign in | Recipe Book',
}

export default function SignInPage() {
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-4 py-12">
      <h1 className="mb-2 text-3xl font-bold">Sign in</h1>
      <p className="mb-6 text-base-content/70">
        Sign in to save recipes and open your cookbook.
      </p>
      <SignInForm />
      <p className="mt-6 text-sm text-base-content/70">
        Need an account?{' '}
        <Link href="/sign-up" className="link link-primary">
          Sign up
        </Link>
      </p>
    </section>
  )
}
