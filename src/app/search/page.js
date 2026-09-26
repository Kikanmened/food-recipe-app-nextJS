'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { RecipeList } from '@/components/recipe'
import { Loader, SearchBar } from '@/components/ui'
import { handleFetch } from '@/utils'

function SearchPageContent() {
  const searchParams = useSearchParams()
  const query = (searchParams.get('q') || '').trim()

  const { data: recipes = [], isPending, isError, error, refetch } = useQuery({
    queryKey: ['recipes'],
    queryFn: () => handleFetch('/api/recipes'),
  })

  const filtered = query
    ? recipes.filter((recipe) =>
        recipe.title.toLowerCase().includes(query.toLowerCase())
      )
    : recipes

  return (
    <section className="mx-auto max-w-6xl space-y-6 px-4 py-12">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Search</h1>
        <SearchBar />
      </div>

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
        <RecipeList recipes={filtered} />
      )}
    </section>
  )
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader />
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  )
}
