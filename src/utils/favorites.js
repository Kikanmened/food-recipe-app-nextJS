export const DUPLICATE_FAVORITE_ERROR = 'Already added to your favorites.'

export async function requestFavorites(method = 'GET', payload, signal) {
  const response = await fetch('/api/favorites', {
    method,
    cache: 'no-store',
    signal,
    ...(payload ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) } : {}),
  })
  const body = await response.json().catch(() => null)
  if (!response.ok) {
    throw Object.assign(new Error(body?.error || 'Unable to update favorites. Please try again.'), { status: response.status })
  }
  if (!body || (method === 'GET' && !Array.isArray(body))) {
    throw new Error('Unable to read your favorites. Please try again.')
  }
  return body
}

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
