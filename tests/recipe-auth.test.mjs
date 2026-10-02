import assert from 'node:assert/strict'
import { beforeEach, mock, test } from 'node:test'
import { registerHooks } from 'node:module'
import { SignJWT } from 'jose'

const secret = 'recipe-auth-test-secret-at-least-32-characters'
const tokenCookie = '__Secure-neon-auth.session_token'
const cacheCookie = '__Secure-neon-auth.local.session_data'
const session = {
  session: {
    id: 'session-1',
    userId: 'account-1',
    expiresAt: new Date(Date.now() + 3600000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  user: {
    id: 'account-1',
    name: 'Test Cook',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
}
const payload = {
  title: 'Jolly Rice',
  category: 'other',
  ingredients: [{ name: 'Rice', amount: '1 cup' }],
  imageUrl: 'https://example.com/rice.jpg',
  steps: ['Boil for 20 minutes'],
}
let requestHeaders
let responseCookies
let upstreamSession
let upstreamStatus
let upstreamCalls
const recipeId = '2b38d9d8-1d0f-46d8-a95e-1b38c69a5146'
let storedRecipe
let storedFavorites
const revalidatePath = mock.fn()
const createRecipe = mock.fn(async (recipe) => ({ id: 'recipe-1', ...recipe }))
const updateRecipe = mock.fn(async (input) => {
  if (storedRecipe?.id !== input.id || storedRecipe.user_id !== input.userId) return null
  storedRecipe = { ...storedRecipe, title: input.title, category: input.category, ingredients: input.ingredients, steps: input.steps, image_url: input.imageUrl }
  return storedRecipe
})
const deleteRecipe = mock.fn(async ({ id, userId }) => {
  if (storedRecipe?.id !== id || storedRecipe.user_id !== userId) return null
  storedRecipe = null
  return { id }
})
const getFavoriteRecipesForUser = mock.fn(async (userId) => [...storedFavorites.values()].filter((item) => item.user_id === userId))
const saveFavoriteRecipe = mock.fn(async ({ userId, recipeId, title, imageUrl, note }) => {
  const key = `${userId}:${recipeId}`
  if (storedFavorites.has(key)) return null
  const favorite = { user_id: userId, recipe_id: recipeId, title, image_url: imageUrl, note }
  storedFavorites.set(key, favorite)
  return favorite
})

process.env.NEON_AUTH_BASE_URL = 'https://auth.example.test/auth'
process.env.NEON_AUTH_COOKIE_SECRET = secret

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (['next/headers', 'next/server', 'next/cache'].includes(specifier)) {
      return nextResolve(`${specifier}.js`, context)
    }
    if (specifier.startsWith('@/')) {
      return nextResolve(new URL(`../src/${specifier.slice(2)}.js`, import.meta.url).href, context)
    }
    return nextResolve(specifier, context)
  },
})

// Keep the real Neon SDK; replace only request context, upstream HTTP, and database writes.
mock.module('next/headers', {
  namedExports: {
    headers: async () => requestHeaders,
    cookies: async () => ({ set: (cookie) => responseCookies.push(cookie) }),
  },
})
mock.module('next/cache', { namedExports: { revalidatePath } })
mock.module(new URL('../src/provider/queries.js', import.meta.url).href, {
  namedExports: {
    createRecipe,
    updateRecipe,
    deleteRecipe,
    getAllRecipes: async () => [],
    getRecipeById: async (id) => storedRecipe?.id === id ? storedRecipe : null,
    getFavoriteRecipesForUser,
    isFavoriteRecipe: async () => false,
    saveFavoriteRecipe,
    updateFavoriteNote: async ({ userId, recipeId, note }) => {
      const favorite = storedFavorites.get(`${userId}:${recipeId}`)
      if (!favorite) return null
      favorite.note = note
      return favorite
    },
    removeFavoriteRecipe: async ({ userId, recipeId }) => {
      const key = `${userId}:${recipeId}`
      const favorite = storedFavorites.get(key)
      storedFavorites.delete(key)
      return favorite || null
    },
  },
})

const { getCurrentUser } = await import('../src/lib/auth/server.js')
const { createRecipeAction, updateRecipeAction, deleteRecipeAction } = await import('../src/app/actions/recipes.js')
const recipes = await import('../src/app/api/recipes/route.js')
const favorites = await import('../src/app/api/favorites/route.js')
const authRoutes = await import('../src/app/api/auth/[...all]/route.js')

beforeEach(() => {
  mock.restoreAll()
  requestHeaders = new Headers({
    host: 'recipes.example.test',
    origin: 'https://recipes.example.test',
    cookie: `${tokenCookie}=valid-test-token`,
    'Next-Action': 'recipe-action',
  })
  responseCookies = []
  upstreamSession = session
  upstreamStatus = 200
  upstreamCalls = []
  storedRecipe = { id: recipeId, user_id: session.user.id, ...payload, image_url: payload.imageUrl }
  storedFavorites = new Map()
  updateRecipe.mock.resetCalls()
  deleteRecipe.mock.resetCalls()
  revalidatePath.mock.resetCalls()
  createRecipe.mock.resetCalls()
  getFavoriteRecipesForUser.mock.resetCalls()
  saveFavoriteRecipe.mock.resetCalls()
  mock.method(globalThis, 'fetch', async (url, options = {}) => {
    assert.equal(new URL(url).origin, 'https://auth.example.test')
    assert.equal(new URL(url).pathname, '/auth/get-session')
    assert.equal(options.method || 'GET', 'GET')
    const headers = new Headers(options.headers)
    upstreamCalls.push(headers)
    const hasToken = headers.get('cookie')?.includes(`${tokenCookie}=valid-test-token`)
    return Response.json(
      upstreamStatus === 200 ? (hasToken ? upstreamSession : null) : { message: 'Service unavailable' },
      { status: upstreamStatus },
    )
  })
})

test('a signed-in recipe action refreshes a missing session cache and saves the account owner', async () => {
  const result = await createRecipeAction({ ...payload, userId: 'forged-account' })
  assert.equal(result.error, undefined)
  assert.equal(result.recipe.userId, session.user.id)
  assert.equal(createRecipe.mock.callCount(), 1)
  assert.ok(responseCookies.some((cookie) => cookie.name === cacheCookie))
  assert.ok(upstreamCalls.every((headers) => headers.get('cookie').includes(tokenCookie)))
})

test('a valid signed cache authenticates without an upstream request', async () => {
  const cache = await new SignJWT(session)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('5m')
    .sign(new TextEncoder().encode(secret))
  requestHeaders.set('cookie', `${tokenCookie}=valid-test-token; ${cacheCookie}=${cache}`)
  assert.equal((await getCurrentUser()).id, session.user.id)
  assert.equal(upstreamCalls.length, 0)
})

test('an expired cache is refreshed from the session token before saving', async () => {
  const cache = await new SignJWT(session)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(Math.floor(Date.now() / 1000) - 60)
    .sign(new TextEncoder().encode(secret))
  requestHeaders.set('cookie', `${tokenCookie}=valid-test-token; ${cacheCookie}=${cache}`)
  assert.equal((await createRecipeAction(payload)).recipe.userId, session.user.id)
  assert.ok(responseCookies.some((cookie) => cookie.name === cacheCookie))
})

test('signed-out requests cannot create recipes through either entry point', async () => {
  requestHeaders.delete('cookie')
  assert.equal((await createRecipeAction({ ...payload, userId: 'account-1' })).error, 'Sign in to add a recipe.')
  const response = await recipes.POST(new Request('https://recipes.example.test/api/recipes', {
    method: 'POST', body: JSON.stringify(payload),
  }))
  assert.equal(response.status, 401)
  assert.equal(createRecipe.mock.callCount(), 0)
})

test('a revoked session cannot create recipes', async () => {
  upstreamSession = null
  assert.equal((await createRecipeAction(payload)).error, 'Sign in to add a recipe.')
  assert.equal(createRecipe.mock.callCount(), 0)
})

test('a leftover signed cache without the session token cannot authenticate', async () => {
  const cache = await new SignJWT(session)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('5m')
    .sign(new TextEncoder().encode(secret))
  requestHeaders.set('cookie', `${cacheCookie}=${cache}`)
  assert.equal((await createRecipeAction(payload)).error, 'Sign in to add a recipe.')
  assert.equal(createRecipe.mock.callCount(), 0)
})

test('authentication outages are not reported as signed-out sessions', async () => {
  upstreamStatus = 503
  assert.equal((await createRecipeAction(payload)).error, 'Unable to verify your session. Please try again.')
  assert.equal(createRecipe.mock.callCount(), 0)
})

for (const [field, value] of Object.entries({ title: ' ', ingredients: [], imageUrl: ' ', steps: [] })) {
  test(`an empty ${field} blocks both recipe entry points`, async () => {
    const incomplete = { ...payload, [field]: value }
    assert.match((await createRecipeAction(incomplete)).error, /required/)
    const response = await recipes.POST(new Request('https://recipes.example.test/api/recipes', {
      method: 'POST', body: JSON.stringify(incomplete),
    }))
    assert.equal(response.status, 400)
    assert.equal(createRecipe.mock.callCount(), 0)
  })
}

test('the recipe API saves the authenticated owner, ignoring a supplied user ID', async () => {
  const response = await recipes.POST(new Request('https://recipes.example.test/api/recipes', {
    method: 'POST', body: JSON.stringify({ ...payload, userId: 'forged-account' }),
  }))
  assert.equal(response.status, 201)
  assert.equal((await response.json()).userId, session.user.id)
})

test('favorites use the same authenticated account', async () => {
  assert.equal((await favorites.GET()).status, 200)
  assert.equal(getFavoriteRecipesForUser.mock.calls[0].arguments[0], session.user.id)
  const response = await favorites.POST(new Request('https://recipes.example.test/api/favorites', {
    method: 'POST', body: JSON.stringify({ recipeId, title: 'Forged title', userId: 'forged-account' }),
  }))
  assert.equal(response.status, 201)
  assert.equal((await response.json()).title, payload.title)
  assert.equal(saveFavoriteRecipe.mock.calls[0].arguments[0].userId, session.user.id)
})

test('signed-out users cannot mutate favorites', async () => {
  requestHeaders.delete('cookie')
  assert.equal((await favorites.GET()).status, 401)
  for (const method of ['POST', 'PUT', 'DELETE']) {
    const response = await favorites[method](new Request('https://recipes.example.test/api/favorites', {
      method, body: JSON.stringify({ recipeId: 'recipe-1', title: payload.title }),
    }))
    assert.equal(response.status, 401)
  }
  assert.equal(saveFavoriteRecipe.mock.callCount(), 0)
})

test('successful sign-out expires the token and cached session even without upstream deletion headers', async () => {
  mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(new URL(url).pathname, '/auth/sign-out')
    assert.equal(options.method, 'POST')
    assert.match(new Headers(options.headers).get('cookie'), /valid-test-token/)
    return Response.json({ success: true })
  })
  const response = await authRoutes.POST(new Request('https://recipes.example.test/api/auth/sign-out', {
    method: 'POST', headers: requestHeaders, body: '{}',
  }), { params: Promise.resolve({ all: ['sign-out'] }) })

  assert.equal(response.status, 200)
  const deletions = response.headers.getSetCookie()
  for (const name of [tokenCookie, cacheCookie]) {
    assert.ok(deletions.some((value) => value.startsWith(`${name}=`) && value.includes('Max-Age=0')))
  }
})

test('failed sign-out preserves the failure response and does not claim local logout', async () => {
  mock.method(globalThis, 'fetch', async () => Response.json({ message: 'Service unavailable' }, { status: 503 }))
  const response = await authRoutes.POST(new Request('https://recipes.example.test/api/auth/sign-out', {
    method: 'POST', headers: requestHeaders, body: '{}',
  }), { params: Promise.resolve({ all: ['sign-out'] }) })
  assert.equal(response.status, 503)
  assert.equal(response.headers.getSetCookie().length, 0)
})

test('the owner can edit a recipe without changing its owner', async () => {
  const result = await updateRecipeAction(recipeId, { ...payload, title: '  Updated rice  ', userId: 'forged-owner' })
  assert.equal(result.recipe.title, 'Updated rice')
  assert.equal(result.recipe.user_id, session.user.id)
  assert.equal(updateRecipe.mock.calls[0].arguments[0].userId, session.user.id)
  assert.ok(revalidatePath.mock.calls.some((call) => call.arguments[0] === `/recipes/${recipeId}`))
})

test('the owner can delete a recipe and cannot delete it twice', async () => {
  assert.deepEqual(await deleteRecipeAction(recipeId), { success: true })
  assert.equal(storedRecipe, null)
  assert.match((await deleteRecipeAction(recipeId)).error, /not found/)
})

test('signed-out users cannot edit or delete, even with a supplied owner ID', async () => {
  requestHeaders.delete('cookie')
  assert.match((await updateRecipeAction(recipeId, { ...payload, userId: session.user.id })).error, /Sign in/)
  assert.match((await deleteRecipeAction(recipeId)).error, /Sign in/)
  assert.equal(updateRecipe.mock.callCount(), 0)
  assert.equal(deleteRecipe.mock.callCount(), 0)
})

test('another account cannot edit or delete the owner\'s recipe', async () => {
  upstreamSession = { ...session, session: { ...session.session, userId: 'account-2' }, user: { ...session.user, id: 'account-2' } }
  assert.match((await updateRecipeAction(recipeId, { ...payload, title: 'Unauthorized change', userId: session.user.id })).error, /permission/)
  assert.match((await deleteRecipeAction(recipeId)).error, /permission/)
  assert.equal(storedRecipe.title, payload.title)
  assert.equal(storedRecipe.user_id, session.user.id)
  assert.equal(updateRecipe.mock.calls[0].arguments[0].userId, 'account-2')
  assert.equal(deleteRecipe.mock.calls[0].arguments[0].userId, 'account-2')
})

test('missing and malformed IDs do not mutate recipes', async () => {
  for (const id of [null, '../recipes', {}, 'bad-id', '00000000-0000-0000-0000-000000000000']) {
    assert.match((await updateRecipeAction(id, payload)).error, /not found/)
    assert.match((await deleteRecipeAction(id)).error, /not found/)
  }
  assert.equal(updateRecipe.mock.callCount(), 1)
  assert.equal(deleteRecipe.mock.callCount(), 1)
  assert.equal(storedRecipe.title, payload.title)
})

for (const incomplete of [
  { ...payload, category: undefined },
  { ...payload, category: '' },
  { ...payload, category: 'seafood' },
  { ...payload, category: ['pasta'] },
  { ...payload, title: ' ' },
  { ...payload, imageUrl: '' },
  { ...payload, ingredients: [] },
  { ...payload, ingredients: [{ name: ' ' }] },
  { ...payload, ingredients: 'rice' },
  { ...payload, steps: [] },
  { ...payload, steps: [' '] },
  { ...payload, steps: 'boil' },
  { ...payload, title: {} },
  null,
]) {
  test(`invalid recipe data is rejected on create and edit: ${JSON.stringify(incomplete)}`, async () => {
    assert.match((await createRecipeAction(incomplete)).error, /required/)
    assert.match((await updateRecipeAction(recipeId, incomplete)).error, /required/)
    const response = await recipes.POST(new Request('https://recipes.example.test/api/recipes', {
      method: 'POST', body: JSON.stringify(incomplete),
    }))
    assert.equal(response.status, 400)
    assert.equal(updateRecipe.mock.callCount(), 0)
    assert.equal(createRecipe.mock.callCount(), 0)
    assert.equal(storedRecipe.title, payload.title)
  })
}

test('authentication failures prevent edits and deletions', async () => {
  upstreamStatus = 503
  assert.match((await updateRecipeAction(recipeId, payload)).error, /Unable to update/)
  assert.match((await deleteRecipeAction(recipeId)).error, /Unable to delete/)
  assert.equal(updateRecipe.mock.callCount(), 0)
  assert.equal(deleteRecipe.mock.callCount(), 0)
})

test('create and edit persist the category selected by the owner', async () => {
  const created = await createRecipeAction({ ...payload, category: 'breakfast' })
  assert.equal(created.recipe.category, 'breakfast')
  assert.equal(createRecipe.mock.calls[0].arguments[0].category, 'breakfast')
  const edited = await updateRecipeAction(recipeId, { ...payload, category: 'vegetarian' })
  assert.equal(edited.recipe.category, 'vegetarian')
  assert.equal(updateRecipe.mock.calls[0].arguments[0].category, 'vegetarian')
})

function favoriteRequest(method, body = { recipeId }) {
  return favorites[method](new Request('https://recipes.example.test/api/favorites', {
    method, body: JSON.stringify(body),
  }))
}

test('favorites persist, reject duplicates without overwriting notes, and can be removed', async () => {
  assert.equal((await favoriteRequest('POST', { recipeId, note: 'Keep this note' })).status, 201)
  const duplicate = await favoriteRequest('POST', { recipeId, note: 'Overwrite attempt' })
  assert.equal(duplicate.status, 409)
  assert.equal((await duplicate.json()).error, 'Already added to your favorites.')
  let list = await (await favorites.GET()).json()
  assert.equal(list.length, 1)
  assert.equal(list[0].note, 'Keep this note')
  assert.equal((await favoriteRequest('PUT', { recipeId, note: 'Updated note' })).status, 200)
  list = await (await favorites.GET()).json()
  assert.equal(list[0].note, 'Updated note')
  assert.equal((await favoriteRequest('DELETE')).status, 200)
  assert.deepEqual(await (await favorites.GET()).json(), [])
  assert.equal((await favoriteRequest('DELETE')).status, 404)
})

test('accounts have independent favorites and cannot edit or remove another account\'s favorite', async () => {
  await favoriteRequest('POST')
  upstreamSession = { ...session, session: { ...session.session, userId: 'account-2' }, user: { ...session.user, id: 'account-2' } }
  assert.deepEqual(await (await favorites.GET()).json(), [])
  assert.equal((await favoriteRequest('PUT', { recipeId, note: 'Unauthorized note' })).status, 404)
  assert.equal((await favoriteRequest('DELETE')).status, 404)
  assert.equal((await favoriteRequest('POST')).status, 201)
  assert.equal(storedFavorites.size, 2)
  assert.equal((await favoriteRequest('DELETE')).status, 200)
  assert.equal(storedFavorites.size, 1)
  assert.equal([...storedFavorites.values()][0].user_id, session.user.id)
})

test('favorites reject malformed input and nonexistent recipes', async () => {
  for (const method of ['POST', 'PUT', 'DELETE']) {
    for (const body of [null, {}, { recipeId: 'bad-id' }]) {
      assert.equal((await favoriteRequest(method, body)).status, 400)
    }
    assert.equal((await favorites[method](new Request('https://recipes.example.test/api/favorites', { method, body: '{' }))).status, 400)
  }
  assert.equal((await favoriteRequest('POST', { recipeId, note: {} })).status, 400)
  storedRecipe = null
  assert.equal((await favoriteRequest('POST')).status, 404)
  assert.equal(saveFavoriteRecipe.mock.callCount(), 0)
})

test('favorites return visible service failures instead of an empty success response', async () => {
  upstreamStatus = 503
  for (const method of ['GET', 'POST', 'PUT', 'DELETE']) {
    const response = method === 'GET' ? await favorites.GET() : await favoriteRequest(method)
    assert.equal(response.status, 500)
    assert.match((await response.json()).error, /Unable/)
  }
})
