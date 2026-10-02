'use client'

import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { authClient, signOutAndRedirect } from '@/lib/auth/client'
import ThemeToggle from './ThemeToggle'

const links = [
  { href: '/', label: 'Home' },
  { href: '/search', label: 'Search' },
  { href: '/recipes', label: 'Recipes' },
  { href: '/favorites', label: 'Favorites' },
]

export default function Navbar() {
  const pathname = usePathname()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [signOutError, setSignOutError] = useState('')
  const { data: session } = authClient.useSession()
  const user = session?.user

  async function handleSignOut() {
    if (isSigningOut) return
    setIsSigningOut(true)
    setSignOutError('')
    try {
      await signOutAndRedirect()
    } catch {
      setSignOutError('Unable to sign out. Please try again.')
      setIsSigningOut(false)
    }
  }

  return (
    <div className="navbar bg-base-200 shadow-sm">
      <div className="navbar-start">
        <div className="dropdown">
          <button type="button" tabIndex={0} className="btn btn-ghost lg:hidden" aria-label="Open menu">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
          </button>
          <ul tabIndex={0} className="menu menu-sm dropdown-content bg-base-100 rounded-box z-10 mt-3 w-52 p-2 shadow">
            {links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={pathname === link.href ? 'active' : ''}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <Link href="/" className="btn btn-ghost text-xl">
          Recipe Book
        </Link>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          {links.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className={pathname === link.href ? 'active' : ''}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="navbar-end gap-2">
        <ThemeToggle />
        {user ? (
          <>
            <span className="hidden max-w-36 truncate text-sm sm:inline">
              {user.name || user.email}
            </span>
            <div className="relative">
              <button type="button" onClick={handleSignOut} disabled={isSigningOut} aria-busy={isSigningOut} aria-label="Sign out" className="btn btn-outline w-24">
                {isSigningOut ? <span aria-hidden="true" className="loading loading-spinner loading-sm" /> : 'Sign out'}
              </button>
              {signOutError ? (
                <p role="alert" className="absolute right-0 top-full z-20 mt-2 w-64 max-w-[calc(100vw-2rem)] rounded bg-base-100 p-3 text-sm text-error shadow-md">
                  {signOutError}
                </p>
              ) : null}
            </div>
          </>
        ) : (
          <>
            <Link href="/sign-in" className="btn btn-ghost">
              Sign in
            </Link>
            <Link href="/sign-up" className="btn btn-primary">
              Sign up
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
