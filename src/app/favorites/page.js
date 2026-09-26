'use client'

import { RecipeList } from '@/components/recipe'
import { useFavorites } from '@/context'

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
      <RecipeList recipes={favorites} />
    </section>
  )
}
