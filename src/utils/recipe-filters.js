import { formatIngredients } from './index.js'

function ingredientText(item) {
  if (item == null) return ''
  if (typeof item === 'string') return item
  if (Array.isArray(item)) return item.join(' ')
  if (typeof item === 'object') {
    return [item.amount, item.name, item.ingredient, item.quantity].filter(Boolean).join(' ')
  }
  return String(item)
}

export function applyRecipeFilters(recipes, { query = '', category = '', sort = 'newest', minIngredients = '', ingredient = '' } = {}) {
  const titleQuery = query.trim().toLowerCase()
  const ingredientQuery = ingredient.trim().toLowerCase()
  const minimum = Number(minIngredients) || 0

  let result = recipes.filter((recipe) => {
    if (category && (recipe.category || 'other') !== category) return false
    if (titleQuery && !recipe.title.toLowerCase().includes(titleQuery)) return false

    const ingredients = formatIngredients(recipe.ingredients)
    if (minimum && ingredients.length < minimum) return false
    if (ingredientQuery && !ingredients.some((item) => ingredientText(item).toLowerCase().includes(ingredientQuery))) return false
    return true
  })

  if (sort === 'title') {
    result = [...result].sort((a, b) => a.title.localeCompare(b.title))
  } else if (sort === 'ingredients') {
    result = [...result].sort((a, b) => formatIngredients(a.ingredients).length - formatIngredients(b.ingredients).length)
  }
  return result
}
