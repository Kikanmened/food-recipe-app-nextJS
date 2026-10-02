import assert from 'node:assert/strict'
import { registerHooks } from 'node:module'
import { beforeEach, mock, test } from 'node:test'

const sql = mock.fn()
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === '@/lib/db') return nextResolve(new URL('../src/lib/db.js', import.meta.url).href, context)
    return nextResolve(specifier, context)
  },
})
mock.module(new URL('../src/lib/db.js', import.meta.url).href, { namedExports: { sql } })
const { createRecipe, updateRecipe, deleteRecipe, saveFavoriteRecipe, updateFavoriteNote, removeFavoriteRecipe } = await import('../src/provider/queries.js')

beforeEach(() => {
  sql.mock.resetCalls()
  sql.mock.mockImplementation(async () => [])
})

test('update scopes the SQL write to both recipe and owner using bound parameters', async () => {
  const result = await updateRecipe({
    id: 'recipe-id', userId: 'owner-id', title: 'New title',
    ingredients: [{ name: 'rice', amount: '1 cup' }], steps: ['Boil'], imageUrl: '/rice.jpg', category: 'vegetarian',
  })
  const [parts, ...values] = sql.mock.calls[0].arguments
  assert.match(parts.join('?'), /where id = \? and user_id = \?/)
  assert.deepEqual(values.slice(-2), ['recipe-id', 'owner-id'])
  assert.match(parts.join('?'), /category = \?/)
  assert.equal(values.at(-3), 'vegetarian')
  assert.deepEqual(JSON.parse(values[1]), [{ name: 'rice', amount: '1 cup' }])
  assert.equal(result, null)
})

test('create stores category as a bound value', async () => {
  await createRecipe({ userId: 'owner-id', title: 'Toast', ingredients: [], steps: [], imageUrl: '/toast.jpg', category: 'breakfast' })
  const [parts, ...values] = sql.mock.calls[0].arguments
  assert.match(parts.join('?'), /image_url, category/)
  assert.equal(values.at(-1), 'breakfast')
})

test('delete scopes the SQL write to both recipe and owner using bound parameters', async () => {
  assert.equal(await deleteRecipe({ id: 'recipe-id', userId: 'owner-id' }), null)
  const [parts, ...values] = sql.mock.calls[0].arguments
  assert.match(parts.join('?'), /delete from recipes\s+where id = \? and user_id = \?/)
  assert.deepEqual(values, ['recipe-id', 'owner-id'])
})

test('saving a duplicate is atomic and never overwrites the original favorite', async () => {
  assert.equal(await saveFavoriteRecipe({ userId: 'owner-id', recipeId: 'recipe-id', title: 'Rice', imageUrl: '/rice.jpg' }), null)
  const [parts, ...values] = sql.mock.calls[0].arguments
  assert.match(parts.join('?'), /on conflict \(user_id, recipe_id\) do nothing/)
  assert.deepEqual(values.slice(0, 2), ['owner-id', 'recipe-id'])
})

test('favorite note updates and removal are scoped to the authenticated account', async () => {
  await updateFavoriteNote({ userId: 'owner-id', recipeId: 'recipe-id', note: 'My note' })
  await removeFavoriteRecipe({ userId: 'owner-id', recipeId: 'recipe-id' })
  for (const call of sql.mock.calls) {
    const [parts, ...values] = call.arguments
    assert.match(parts.join('?'), /where user_id = \? and recipe_id = \?/)
    assert.deepEqual(values.slice(-2), ['owner-id', 'recipe-id'])
  }
})
