'use client'

import { useState } from 'react'
import Link from 'next/link'
import { authClient } from '@/lib/auth/client'
import { useFavorites } from '@/context/FavoritesContext'

export default function FavoriteButton({ recipe }) {
  const { data: session } = authClient.useSession()
  const { isFavorite, isFavoritePending, isLoading, error: loadError, refetch, addFavorite, removeFavorite } = useFavorites()
  const [feedback, setFeedback] = useState(null)
  const [pendingAction, setPendingAction] = useState('')
  const saved = isFavorite(recipe.id)
  const pending = Boolean(pendingAction || isFavoritePending(recipe.id))

  async function handleFavorite() {
    if (pending) return
    setFeedback(null)
    setPendingAction(saved ? 'remove' : 'add')
    try {
      if (saved) await removeFavorite(recipe.id)
      else await addFavorite(recipe)
      setFeedback({ type: 'success', message: saved ? 'Removed from your favorites.' : 'Added to your favorites.' })
    } catch (error) {
      setFeedback({ type: 'error', message: error.message || 'Unable to update favorites. Please try again.' })
    } finally {
      setPendingAction('')
    }
  }

  if (!session?.user) return <Link href="/sign-in" className="btn btn-primary">Sign in to save</Link>

  return (
    <div className="min-w-0 space-y-2">
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={handleFavorite} disabled={isLoading || pending} aria-busy={pending} className={`btn min-w-44 ${saved ? 'btn-outline' : 'btn-primary'}`}>
          {pending ? pendingAction === 'remove' ? 'Removing...' : 'Saving...' : isLoading ? 'Checking favorites...' : saved ? 'Remove favorite' : 'Save favorite'}
        </button>
        {saved ? <Link href="/favorites" className="link">View favorites</Link> : null}
      </div>
      {saved ? <span className="badge badge-success">Saved to favorites</span> : null}
      {feedback ? (
        <p role={feedback.type === 'error' ? 'alert' : 'status'} className={`text-sm ${feedback.type === 'error' ? 'text-error' : 'text-success'}`}>
          {feedback.message}
        </p>
      ) : null}
      {loadError ? (
        <div className="space-y-1">
          <p role="alert" className="text-sm text-error">{loadError.message}</p>
          <button type="button" onClick={() => refetch()} className="btn btn-ghost btn-sm">Retry loading favorites</button>
        </div>
      ) : null}
    </div>
  )
}
