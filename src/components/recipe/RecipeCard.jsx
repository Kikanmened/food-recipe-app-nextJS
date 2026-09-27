import Link from 'next/link'
import { formatIngredients } from '@/utils'
import RecipeImage from './RecipeImage'

export default function RecipeCard({ recipe }) {
  const ingredients = formatIngredients(recipe.ingredients)
  const stepCount = Array.isArray(recipe.steps) ? recipe.steps.length : 0

  return (
    <article className="card bg-base-200 shadow-md overflow-hidden">
      <div className="h-48 w-full overflow-hidden bg-base-300">
        <RecipeImage recipe={recipe} className="h-full w-full object-cover" />
      </div>
      <div className="card-body">
        <h2 className="card-title">{recipe.title}</h2>
        <div className="flex flex-wrap gap-2">
          <span className="badge badge-outline">{ingredients.length} ingredients</span>
          <span className="badge badge-outline">{stepCount} steps</span>
        </div>
        <div className="card-actions justify-end">
          <Link href={`/recipes/${recipe.id}`} className="btn btn-primary btn-sm">
            View recipe
          </Link>
        </div>
      </div>
    </article>
  )
}
