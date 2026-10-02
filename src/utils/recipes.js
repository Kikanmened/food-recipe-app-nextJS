import { isRecipeCategory } from './recipe-categories.js'

export const RECIPE_REQUIRED_FIELDS_ERROR = 'title, category, ingredients, photo URL, and steps are required; select a valid category'

export function normalizeRecipeInput(payload) {
  const title = typeof payload?.title === 'string' ? payload.title.trim() : ''
  const imageUrl = typeof payload?.imageUrl === 'string' ? payload.imageUrl.trim() : ''
  const category = payload?.category
  const ingredients = Array.isArray(payload?.ingredients)
    ? payload.ingredients.map((item) => ({
        name: typeof item?.name === 'string' ? item.name.trim() : '',
        amount: typeof item?.amount === 'string' ? item.amount.trim() || 'to taste' : 'to taste',
      }))
    : []
  const steps = Array.isArray(payload?.steps)
    ? payload.steps.map((step) => typeof step === 'string' ? step.trim() : '')
    : []

  if (!title || !imageUrl || !isRecipeCategory(category) || !ingredients.length || ingredients.some((item) => !item.name)
    || !steps.length || steps.some((step) => !step)) {
    return null
  }

  return { title, imageUrl, category, ingredients, steps }
}

export function isRecipeId(id) {
  return typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
}
