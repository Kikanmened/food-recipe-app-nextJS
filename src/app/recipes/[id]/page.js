import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RecipeDetails } from '@/components/recipe'
import { getRecipeById } from '@/provider/queries'

export async function generateMetadata({ params }) {
  const { id } = await params

  try {
    const recipe = await getRecipeById(id)
    if (!recipe) return { title: 'Recipe not found | Recipe Book' }
    return { title: `${recipe.title} | Recipe Book` }
  } catch {
    return { title: 'Recipe | Recipe Book' }
  }
}

export default async function RecipeDetailsPage({ params }) {
  const { id } = await params
  let recipe = null

  try {
    recipe = await getRecipeById(id)
  } catch {
    notFound()
  }

  if (!recipe) {
    notFound()
  }

  return (
    <section className="mx-auto max-w-3xl space-y-6 px-4 py-12">
      <Link href="/recipes" className="link link-hover text-base-content/70">
        Back to recipes
      </Link>
      <RecipeDetails recipe={recipe} />
    </section>
  )
}
