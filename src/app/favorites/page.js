'use client'

import { useState } from 'react'
import Link from 'next/link'
import RecipeImage from '@/components/recipe/RecipeImage'
import { Button } from '@/components/ui'
import { useFavorites } from '@/context/FavoritesContext'

function FavoriteNoteCard({ favorite, onRemoved }) {
  const { updateNote, removeFavorite, isFavoritePending } = useFavorites()
  const [draft, setDraft] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [action, setAction] = useState('')
  const note = draft ?? favorite.note ?? ''
  const pending = Boolean(action || isFavoritePending(favorite.id))

  async function handleAction(nextAction) {
    if (pending) return
    setAction(nextAction)
    setFeedback(null)
    try {
      if (nextAction === 'remove') {
        await removeFavorite(favorite.id)
        onRemoved()
      } else {
        await updateNote(favorite.id, note)
        setDraft(null)
        setFeedback({ type: 'success', message: 'Note saved.' })
      }
    } catch (error) {
      setFeedback({ type: 'error', message: error.message || 'Unable to update this favorite.' })
    } finally {
      setAction('')
    }
  }

  return (
    <article className="card bg-base-200 shadow-md overflow-hidden">
      <div className="h-48 w-full overflow-hidden bg-base-300">
        <RecipeImage recipe={favorite} className="h-full w-full object-cover" />
      </div>
      <div className="card-body space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h2 className="card-title">{favorite.title}</h2>
          <Link href={`/recipes/${favorite.id}`} className="btn btn-primary btn-sm">
            View recipe
          </Link>
        </div>

        <label className="form-control w-full">
          <span className="label-text mb-1">Personal note</span>
          <textarea
            value={note}
            onChange={(event) => setDraft(event.target.value)}
            disabled={pending}
            className="textarea textarea-bordered min-h-24 w-full"
            placeholder="Add a note about this recipe..."
          />
        </label>

        {feedback ? <p role={feedback.type === 'error' ? 'alert' : 'status'} className={feedback.type === 'error' ? 'text-error' : 'text-success'}>{feedback.message}</p> : null}

        <div className="card-actions justify-end">
          <Button variant="outline" className="min-w-28" disabled={pending} onClick={() => handleAction('remove')}>
            {action === 'remove' ? 'Removing...' : 'Remove'}
          </Button>
          <Button className="min-w-28" disabled={pending} onClick={() => handleAction('note')}>
            {action === 'note' ? 'Saving...' : 'Save note'}
          </Button>
        </div>
      </div>
    </article>
  )
}

export default function FavoritesPage() {
  const { favorites, isLoading, error, refetch } = useFavorites()
  const [message, setMessage] = useState('')

  return (
    <section className="mx-auto max-w-6xl space-y-6 px-4 py-12">
      <div>
        <h1 className="text-3xl font-bold">Favorites</h1>
        <p className="text-base-content/70">
          Recipes you saved to your cookbook.
        </p>
      </div>

      {message ? <p role="status" className="text-success">{message}</p> : null}
      {isLoading ? <p role="status">Loading favorites...</p> : null}
      {error ? (
        <div className="space-y-3">
          <p role="alert" className="text-error">{error.message}</p>
          <Button variant="outline" onClick={() => refetch()}>Try again</Button>
        </div>
      ) : null}
      {favorites.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {favorites.map((favorite) => (
            <FavoriteNoteCard key={favorite.id} favorite={favorite} onRemoved={() => setMessage('Removed from your favorites.')} />
          ))}
        </div>
      ) : !isLoading && !error ? (
        <p className="text-base-content/70">No favorites yet. Save a recipe to add a note.</p>
      ) : null}
    </section>
  )
}
