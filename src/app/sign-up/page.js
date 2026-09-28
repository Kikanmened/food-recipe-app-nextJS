import Link from 'next/link'
import { SignUpForm } from '@/components/auth'

export const metadata = {
  title: 'Sign up | Recipe Book',
}

export default function SignUpPage() {
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-4 py-12">
      <h1 className="mb-2 text-3xl font-bold">Sign up</h1>
      <p className="mb-6 text-base-content/70">
        Create an account to save recipes and open your cookbook.
      </p>
      <SignUpForm />
      <p className="mt-6 text-sm text-base-content/70">
        Already have an account?{' '}
        <Link href="/sign-in" className="link link-primary">
          Sign in
        </Link>
      </p>
    </section>
  )
}
