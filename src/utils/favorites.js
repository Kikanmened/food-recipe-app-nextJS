export function normalizeFavorite(raw = {}) {
  const id = raw.recipe_id ?? raw.id ?? raw.recipeId ?? ''

  return {
    id: String(id),
    title: raw.title ?? '',
    image_url: raw.image_url ?? raw.imageUrl ?? '',
    note: raw.note ?? '',
    savedAt:
      raw.saved_at ??
      raw.savedAt ??
      raw.created_at ??
      raw.createdAt ??
      new Date().toISOString(),
    ingredients: Array.isArray(raw.ingredients) ? raw.ingredients : [],
    steps: Array.isArray(raw.steps) ? raw.steps : [],
  }
}

export function normalizeFavoriteList(items = []) {
  return items.map(normalizeFavorite)
}

export function buildFavoritePayload(recipe = {}) {
  const id = recipe.id ?? recipe.recipeId ?? ''

  return {
    recipeId: id,
    title: recipe.title ?? '',
    imageUrl: recipe.image_url ?? recipe.imageUrl ?? '',
    note: recipe.note ?? '',
  }
}
