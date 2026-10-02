'use client'

import { useEffect, useMemo, useState } from 'react'
import { authClient } from '@/lib/auth/client'
import { FavoritesContext } from './FavoritesContext'

function toFavoriteItem(raw) {
  return {
    id: String(raw.recipe_id ?? raw.id ?? raw.recipeId),
    title: raw.title ?? '',
    image_url: raw.image_url ?? raw.imageUrl ?? '',
    note: raw.note ?? '',
    savedAt: raw.saved_at ?? raw.savedAt ?? raw.created_at ?? raw.createdAt ?? new Date().toISOString(),
  }
}

export default function FavoritesState({ children }) {
  const { data: session } = authClient.useSession()
  const user = session?.user
  const [favorites, setFavorites] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!user?.id) {
      setFavorites([])
      return
    }

    let isActive = true

    async function loadFavorites() {
      setIsLoading(true)
      try {
        const response = await fetch('/api/favorites', { cache: 'no-store' })
        const payload = await response.json()

        if (!isActive) return

        if (!response.ok) {
          setFavorites([])
          return
        }

        setFavorites(Array.isArray(payload) ? payload.map(toFavoriteItem) : [])
      } catch {
        if (isActive) {
          setFavorites([])
        }
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    loadFavorites()

    return () => {
      isActive = false
    }
  }, [user?.id])

  const value = useMemo(() => ({
    favorites,
    isLoading,
    isFavorite(recipeId) {
      return favorites.some((favorite) => favorite.id === String(recipeId))
    },
    async addFavorite(recipe) {
      if (!user?.id) return

      const payload = {
        recipeId: recipe.id,
        title: recipe.title,
        imageUrl: recipe.image_url || recipe.imageUrl || '',
        note: recipe.note || '',
      }

      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) return

      const body = await response.json()
      const favorite = toFavoriteItem(body)

      setFavorites((current) => {
        if (current.some((item) => item.id === favorite.id)) {
          return current
        }

        return [favorite, ...current]
      })
    },
    async updateNote(recipeId, note) {
      if (!user?.id) return

      const response = await fetch('/api/favorites', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipeId, note }),
      })

      if (!response.ok) return

      const updatedFavorite = await response.json()
      setFavorites((current) =>
        current.map((favorite) =>
          favorite.id === String(recipeId)
            ? toFavoriteItem(updatedFavorite)
            : favorite
        )
      )
    },
    async removeFavorite(recipeId) {
      if (!user?.id) return

      const response = await fetch('/api/favorites', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipeId }),
      })

      if (!response.ok) return

      setFavorites((current) =>
        current.filter((favorite) => favorite.id !== String(recipeId))
      )
    },
  }), [favorites, isLoading, user?.id])

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  )
}
