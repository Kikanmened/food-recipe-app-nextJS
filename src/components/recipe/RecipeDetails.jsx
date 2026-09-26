'use client'

import { Button } from '@/components/ui'
import { useFavorites } from '@/context'
import { formatIngredients } from '@/utils'

function ingredientLabel(item) {
  if (item == null) return ''
  if (typeof item === 'string') return item
  if (Array.isArray(item)) {
    const [name, amount] = item
    return amount ? `${amount} ${name}` : String(name)
  }
  if (typeof item === 'object') {
    const name = item.name || item.ingredient || ''
    const amount = item.amount || item.quantity || ''
    return [amount, name].filter(Boolean).join(' ')
  }
  return String(item)
}

export default function RecipeDetails({ recipe }) {
  const { isFavorite, addFavorite, removeFavorite } = useFavorites()
  const saved = isFavorite(recipe.id)
  const ingredients = formatIngredients(recipe.ingredients)
  const steps = Array.isArray(recipe.steps) ? recipe.steps : []

  return (
    <article className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <h1 className="text-3xl font-bold">{recipe.title}</h1>
        <Button
          variant={saved ? 'outline' : 'primary'}
          onClick={() => (saved ? removeFavorite(recipe.id) : addFavorite(recipe))}
        >
          {saved ? 'Remove favorite' : 'Save favorite'}
        </Button>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Ingredients</h2>
        <ul className="list-disc space-y-1 pl-5">
          {ingredients.map((item, index) => (
            <li key={index}>{ingredientLabel(item)}</li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Steps</h2>
        <ol className="list-decimal space-y-2 pl-5">
          {steps.map((step, index) => (
            <li key={index}>{step}</li>
          ))}
        </ol>
      </section>
    </article>
  )
}
