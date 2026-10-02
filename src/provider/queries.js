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
export async function createRecipe({ userId, title, ingredients, steps, imageUrl, category }) {
  const ingredientsJson = JSON.stringify(ingredients)

  const rows = await sql`
    insert into recipes (user_id, title, ingredients, steps, image_url, category)
    values (${userId}, ${title}, ${ingredientsJson}::jsonb, ${steps}, ${imageUrl || null}, ${category})
    returning *
  `
  return rows[0]
}

export async function updateRecipe({ id, userId, title, ingredients, steps, imageUrl, category }) {
  const rows = await sql`
    update recipes
    set title = ${title}, ingredients = ${JSON.stringify(ingredients)}::jsonb,
        steps = ${steps}, image_url = ${imageUrl}, category = ${category}
    where id = ${id} and user_id = ${userId}
    returning *
  `
  return rows[0] || null
}

export async function deleteRecipe({ id, userId }) {
  const rows = await sql`
    delete from recipes
    where id = ${id} and user_id = ${userId}
    returning id
  `
  return rows[0] || null
}

export async function getFavoriteRecipesForUser(userId) {
  return await sql`
    select
      f.recipe_id as id,
      f.recipe_id,
      f.note,
      f.created_at,
      r.title,
      r.image_url,
      r.ingredients,
      r.steps
    from favorite_recipes f
    join recipes r on r.id = f.recipe_id
    where f.user_id = ${userId}
    order by f.created_at desc
  `
}

export async function saveFavoriteRecipe({ userId, recipeId, title, imageUrl, note = '' }) {
  const rows = await sql`
    insert into favorite_recipes (user_id, recipe_id, title, image_url, note)
    values (${userId}, ${recipeId}, ${title}, ${imageUrl || null}, ${note})
    on conflict (user_id, recipe_id) do nothing
    returning *
  `

  return rows[0] || null
}

export async function updateFavoriteNote({ userId, recipeId, note }) {
  const rows = await sql`
    with updated as (
      update favorite_recipes
      set note = ${note ?? ''}
      where user_id = ${userId} and recipe_id = ${recipeId}
      returning recipe_id, note, created_at
    )
    select updated.*, r.title, r.image_url
    from updated join recipes r on r.id = updated.recipe_id
  `

  return rows[0] || null
}

export async function removeFavoriteRecipe({ userId, recipeId }) {
  const rows = await sql`
    delete from favorite_recipes
    where user_id = ${userId} and recipe_id = ${recipeId}
    returning *
  `

  return rows[0] || null
}

export async function isFavoriteRecipe({ userId, recipeId }) {
  const rows = await sql`
    select 1
    from favorite_recipes
    where user_id = ${userId} and recipe_id = ${recipeId}
    limit 1
  `

  return rows.length > 0
}
