'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui'
import { useFavorites } from '@/context'

function FavoriteNoteCard({ favorite }) {
  const { updateNote, removeFavorite } = useFavorites()
  const [note, setNote] = useState(favorite.note || '')

  useEffect(() => {
    setNote(favorite.note || '')
  }, [favorite.note])

  return (
    <article className="card bg-base-200 shadow-md">
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
            onChange={(event) => setNote(event.target.value)}
            className="textarea textarea-bordered min-h-24 w-full"
            placeholder="Add a note about this recipe..."
          />
        </label>

        <div className="card-actions justify-end">
          <Button variant="outline" onClick={() => removeFavorite(favorite.id)}>
            Remove
          </Button>
          <Button onClick={() => updateNote(favorite.id, note)}>
            Save note
          </Button>
        </div>
      </div>
    </article>
  )
}

export default function FavoritesPage() {
  const { favorites } = useFavorites()

  return (
    <section className="mx-auto max-w-6xl space-y-6 px-4 py-12">
      <div>
        <h1 className="text-3xl font-bold">Favorites</h1>
        <p className="text-base-content/70">
          Recipes you saved to your cookbook.
        </p>
      </div>

      {favorites.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {favorites.map((favorite) => (
            <FavoriteNoteCard key={favorite.id} favorite={favorite} />
          ))}
        </div>
      ) : (
        <p className="text-base-content/70">No favorites yet. Save a recipe to add a note.</p>
      )}
    </section>
  )
}
