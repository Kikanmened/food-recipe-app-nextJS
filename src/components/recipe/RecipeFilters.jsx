'use client'

import { formatIngredients } from '@/utils'

function ingredientText(item) {
  if (item == null) return ''
  if (typeof item === 'string') return item
  if (Array.isArray(item)) return item.join(' ')
  if (typeof item === 'object') {
    return [item.amount, item.name, item.ingredient, item.quantity]
      .filter(Boolean)
      .join(' ')
  }
  return String(item)
}

export function applyRecipeFilters(recipes, { query = '', sort = 'newest', minIngredients = '', ingredient = '' } = {}) {
  const titleQuery = query.trim().toLowerCase()
  const ingredientQuery = ingredient.trim().toLowerCase()
  const minimum = Number(minIngredients) || 0

  let result = recipes.filter((recipe) => {
    if (titleQuery && !recipe.title.toLowerCase().includes(titleQuery)) {
      return false
    }

    const ingredients = formatIngredients(recipe.ingredients)
    if (minimum && ingredients.length < minimum) {
      return false
    }

    if (ingredientQuery) {
      const matchesIngredient = ingredients.some((item) =>
        ingredientText(item).toLowerCase().includes(ingredientQuery)
      )
      if (!matchesIngredient) return false
    }

    return true
  })

  if (sort === 'title') {
    result = [...result].sort((a, b) => a.title.localeCompare(b.title))
  } else if (sort === 'ingredients') {
    result = [...result].sort(
      (a, b) => formatIngredients(a.ingredients).length - formatIngredients(b.ingredients).length
    )
  }

  return result
}

export default function RecipeFilters({ filters, onChange }) {
  function handleChange(event) {
    const { name, value } = event.target
    onChange({ ...filters, [name]: value })
  }

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <label className="form-control w-full">
        <span className="label-text mb-1">Sort</span>
        <select
          name="sort"
          value={filters.sort}
          onChange={handleChange}
          className="select select-bordered w-full"
        >
          <option value="newest">Newest</option>
          <option value="title">Title A–Z</option>
          <option value="ingredients">Fewest ingredients</option>
        </select>
      </label>

      <label className="form-control w-full">
        <span className="label-text mb-1">Min ingredients</span>
        <select
          name="minIngredients"
          value={filters.minIngredients}
          onChange={handleChange}
          className="select select-bordered w-full"
        >
          <option value="">Any</option>
          <option value="4">4+</option>
          <option value="5">5+</option>
          <option value="6">6+</option>
        </select>
      </label>

      <label className="form-control w-full">
        <span className="label-text mb-1">Ingredient contains</span>
        <input
          name="ingredient"
          value={filters.ingredient}
          onChange={handleChange}
          className="input input-bordered w-full"
          placeholder="chicken, pasta..."
        />
      </label>
    </div>
  )
}
