'use client'

import { useQuery } from '@tanstack/react-query'
import RecipeForm from '@/components/recipe/RecipeForm'
import { RecipeList } from '@/components/recipe'
import { Loader } from '@/components/ui'
import { handleFetch } from '@/utils'

export default function RecipesPage() {
  const { data: recipes = [], isPending, isError, error, refetch } = useQuery({
    queryKey: ['recipes'],
    queryFn: () => handleFetch('/api/recipes'),
  })

  return (
    <section className="mx-auto max-w-6xl space-y-6 px-4 py-12">
      <div>
        <h1 className="text-3xl font-bold">Recipes</h1>
        <p className="text-base-content/70">
          Browse every recipe in the cookbook.
        </p>
      </div>

      <RecipeForm />

      {isPending ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <Loader />
        </div>
      ) : isError ? (
        <div className="space-y-4">
          <p className="text-error">{error.message}</p>
          <button type="button" className="btn btn-primary" onClick={() => refetch()}>
            Try again
          </button>
        </div>
      ) : (
        <RecipeList recipes={recipes} />
      )}
    </section>
  )
}
