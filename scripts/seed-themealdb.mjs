import { readFileSync } from 'node:fs'
import { neon } from '@neondatabase/serverless'

const SEARCHES = [
  'chicken',
  'pasta',
  'beef',
  'curry',
  'rice',
  'salmon',
  'pancake',
  'salad',
  'soup',
  'chocolate',
  'lamb',
  'pork',
]
const LIMIT = Number(process.env.SEED_LIMIT) || 40
const USER_ID = 'seed-user'

function loadEnv() {
  const text = readFileSync(new URL('../.env.local', import.meta.url), 'utf8')

  for (const line of text.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue

    const index = trimmed.indexOf('=')
    const key = trimmed.slice(0, index).trim()
    let value = trimmed.slice(index + 1).trim()

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    if (!process.env[key]) process.env[key] = value
  }
}

function mealToRecipe(meal) {
  const ingredients = []

  for (let index = 1; index <= 20; index += 1) {
    const name = meal[`strIngredient${index}`]?.trim()
    const amount = meal[`strMeasure${index}`]?.trim()
    if (!name) continue
    ingredients.push({ name, amount: amount || 'to taste' })
  }

  const steps = String(meal.strInstructions || '')
    .split(/\r?\n/)
    .map((step) => step.trim())
    .filter(Boolean)

  return {
    title: meal.strMeal.trim(),
    ingredients,
    steps: steps.length ? steps : ['Follow the original recipe instructions.'],
    imageUrl: meal.strMealThumb || null,
  }
}

async function searchMeals(query) {
  const response = await fetch(
    `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`
  )

  if (!response.ok) {
    throw new Error(`TheMealDB search failed for "${query}": ${response.status}`)
  }

  const data = await response.json()
  return data.meals || []
}

loadEnv()

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set')
}

const sql = neon(process.env.DATABASE_URL)

await sql`alter table recipes add column if not exists image_url text`

const existing = await sql`select title from recipes`
const existingTitles = new Set(existing.map((row) => row.title.toLowerCase()))
const seen = new Set()
const queued = []

for (const query of SEARCHES) {
  const meals = await searchMeals(query)

  for (const meal of meals) {
    if (queued.length >= LIMIT) break

    const recipe = mealToRecipe(meal)
    const key = recipe.title.toLowerCase()

    if (existingTitles.has(key) || seen.has(key) || !recipe.ingredients.length) {
      continue
    }

    seen.add(key)
    queued.push(recipe)
  }

  if (queued.length >= LIMIT) break
}

let inserted = 0

for (const recipe of queued) {
  const rows = await sql`
    insert into recipes (user_id, title, ingredients, steps, image_url)
    select
      ${USER_ID},
      ${recipe.title},
      ${JSON.stringify(recipe.ingredients)}::jsonb,
      ${recipe.steps},
      ${recipe.imageUrl}
    where not exists (
      select 1 from recipes where lower(title) = ${recipe.title.toLowerCase()}
    )
    returning title
  `

  if (rows.length) inserted += 1
}

const [{ count }] = await sql`select count(*)::int as count from recipes`

console.log(`TheMealDB seed complete. inserted=${inserted} skipped_existing=${existing.length} total=${count}`)
console.log('Recipe photos come from TheMealDB (https://www.themealdb.com).')
