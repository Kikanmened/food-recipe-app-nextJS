'use client'

import { useEffect, useMemo, useState } from 'react'
import { FavoritesContext } from './FavoritesContext'

const STORAGE_KEY = 'recipe-book-favorites'

function readFavorites() {
  if (typeof window === 'undefined') return []

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export default function FavoritesState({ children }) {
  const [favorites, setFavorites] = useState([])
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    setFavorites(readFavorites())
    setIsReady(true)
  }, [])

  useEffect(() => {
    if (!isReady) return
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
  }, [favorites, isReady])

  const value = useMemo(() => ({
    favorites,
    isFavorite(recipeId) {
      return favorites.some((favorite) => favorite.id === recipeId)
    },
    addFavorite(recipe) {
      setFavorites((current) => {
        if (current.some((favorite) => favorite.id === recipe.id)) {
          return current
        }

        return [
          ...current,
          {
            id: recipe.id,
            title: recipe.title,
            note: recipe.note || '',
            savedAt: new Date().toISOString(),
          },
        ]
      })
    },
    updateNote(recipeId, note) {
      setFavorites((current) =>
        current.map((favorite) =>
          favorite.id === recipeId ? { ...favorite, note } : favorite
        )
      )
    },
    removeFavorite(recipeId) {
      setFavorites((current) =>
        current.filter((favorite) => favorite.id !== recipeId)
      )
    },
  }), [favorites])

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  )
}
