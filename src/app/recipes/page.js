'use client'

import { useQuery } from '@tanstack/react-query'
import { RecipeList } from '@/components/recipe'
import { Loader } from '@/components/ui'
import { handleFetch } from '@/utils'

export default function RecipesPage() {
  const { data: recipes = [], isPending, isError, error, refetch } = useQuery({
    queryKey: ['recipes'],
    queryFn: () => handleFetch('/api/recipes'),
  })

  if (isPending) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader />
      </div>
    )
  }

  if (isError) {
    return (
      <section className="mx-auto max-w-6xl space-y-4 px-4 py-12">
        <h1 className="text-3xl font-bold">Recipes</h1>
        <p className="text-error">{error.message}</p>
        <button type="button" className="btn btn-primary" onClick={() => refetch()}>
          Try again
        </button>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-6xl space-y-6 px-4 py-12">
      <div>
        <h1 className="text-3xl font-bold">Recipes</h1>
        <p className="text-base-content/70">
          Browse every recipe in the cookbook.
        </p>
      </div>
      <RecipeList recipes={recipes} />
    </section>
  )
}
