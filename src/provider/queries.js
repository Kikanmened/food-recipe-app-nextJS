import { sql } from '@/lib/db'

/**
 * Fetch all recipes ordered by newest first.
 */
export async function getAllRecipes() {
  return await sql`select * from recipes order by created_at desc`
}

/**
 * Fetch a single recipe by its UUID.
 * Returns null if not found.
 */
export async function getRecipeById(id) {
  const rows = await sql`select * from recipes where id = ${id}`
  return rows[0] || null
}

/**
 * Search recipes by title (case-insensitive partial match).
 */
export async function searchRecipes(query) {
  const pattern = `%${query}%`
  return await sql`
    select * from recipes
    where title ilike ${pattern}
    order by created_at desc
  `
}

/**
 * Insert a new recipe and return it.
 */
export async function createRecipe({ userId, title, ingredients, steps }) {
  const rows = await sql`
    insert into recipes (user_id, title, ingredients, steps)
    values (${userId}, ${title}, ${ingredients}, ${steps})
    returning *
  `
  return rows[0]
}
