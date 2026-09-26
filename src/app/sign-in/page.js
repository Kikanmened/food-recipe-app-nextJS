import { SignInForm } from '@/components/auth'

export const metadata = {
  title: 'Sign in | Recipe Book',
}

export default function SignInPage() {
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-4 py-12">
      <h1 className="mb-2 text-3xl font-bold">Sign in</h1>
      <p className="mb-6 text-base-content/70">
        Use your Neon Auth account to save recipes and open your cookbook.
      </p>
      <SignInForm />
    </section>
  )
}
