// Shared utility helpers for the recipe app

/**
 * Truncate a string to a maximum length and append an ellipsis.
 */
export function truncateText(text, maxLength = 120) {
  if (!text || text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

/**
 * Convert a recipe title or category into a URL-friendly slug.
 */
export function slugify(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Format a JSONB ingredients object or array into a readable string list.
 */
export function formatIngredients(ingredients) {
  if (!ingredients) return []
  if (Array.isArray(ingredients)) return ingredients
  if (typeof ingredients === 'object') return Object.entries(ingredients)
  return [String(ingredients)]
}

/**
 * Safe wrapper around fetch that returns JSON or throws a friendly error.
 */
export async function handleFetch(url, options = {}) {
  const response = await fetch(url, options)

  if (!response.ok) {
    const message = `Request failed: ${response.status} ${response.statusText}`
    throw new Error(message)
  }

  return response.json()
}

/**
 * Build a query string from a plain object, omitting empty values.
 */
export function buildQueryString(params) {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value))
    }
  })

  const query = searchParams.toString()
  return query ? `?${query}` : ''
}
