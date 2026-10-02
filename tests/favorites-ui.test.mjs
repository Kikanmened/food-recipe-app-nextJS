import assert from 'node:assert/strict'
import { after, afterEach, beforeEach, mock, test } from 'node:test'
import { registerHooks } from 'node:module'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'
import { JSDOM } from 'jsdom'
import React, { useState } from 'react'

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost/' })
for (const name of ['window', 'self', 'document', 'navigator', 'HTMLElement', 'Node', 'MutationObserver']) {
  Object.defineProperty(globalThis, name, { value: dom.window[name], configurable: true })
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true
const sourceRoot = new URL('../src/', import.meta.url).href
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (['next/link', 'next/navigation'].includes(specifier)) return nextResolve(`${specifier}.js`, context)
    const candidate = specifier.startsWith('@/')
      ? new URL(specifier.slice(2), sourceRoot).href
      : specifier.startsWith('.') && context.parentURL?.startsWith(sourceRoot)
        ? new URL(specifier, context.parentURL).href : null
    if (candidate) {
      for (const suffix of ['', '.js', '.jsx', '/index.js']) {
        if (existsSync(fileURLToPath(candidate + suffix)) && /\.(js|jsx)$/.test(candidate + suffix)) {
          return nextResolve(candidate + suffix, context)
        }
      }
    }
    return nextResolve(specifier, context)
  },
  load(url, context, nextLoad) {
    if (url.startsWith(sourceRoot) && /\.(js|jsx)$/.test(url)) {
      const source = ts.transpileModule(readFileSync(fileURLToPath(url), 'utf8'), {
        fileName: fileURLToPath(url),
        compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
      }).outputText
      return { format: 'module', source, shortCircuit: true }
    }
    return nextLoad(url, context)
  },
})

let accountId
mock.module(new URL('../src/lib/auth/client.js', import.meta.url).href, {
  namedExports: { authClient: { useSession: () => ({ data: accountId ? { user: { id: accountId } } : null, isPending: false }) } },
})
const { render, screen, waitFor, cleanup, act } = await import('@testing-library/react')
const { default: userEvent } = await import('@testing-library/user-event')
const { QueryClient, QueryClientProvider } = await import('@tanstack/react-query')
const { default: FavoritesState } = await import('../src/context/FavoritesState.jsx')
const { default: FavoriteButton } = await import('../src/components/recipe/FavoriteButton.jsx')
const { default: FavoritesPage } = await import('../src/app/favorites/page.js')
const { useFavorites } = await import('../src/context/FavoritesContext.js')
const h = React.createElement
const recipe = { id: '2b38d9d8-1d0f-46d8-a95e-1b38c69a5146', title: 'Jolly Rice', image_url: '' }
let client, user, records, calls, failure

function DuplicateAttempt() {
  const { addFavorite } = useFavorites()
  const [error, setError] = useState('')
  return h('div', null,
    h('button', { onClick: async () => { try { await addFavorite(recipe) } catch (error) { setError(error.message) } } }, 'Add again'),
    error ? h('p', { role: 'alert' }, error) : null)
}

function app() {
  return h(QueryClientProvider, { client }, h(FavoritesState, null,
    h(FavoriteButton, { recipe }), h(FavoritesPage), h(DuplicateAttempt)))
}

beforeEach(() => {
  accountId = 'account-1'
  records = new Map()
  calls = []
  failure = null
  client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity }, mutations: { retry: false, gcTime: Infinity } } })
  user = userEvent.setup({ document: dom.window.document })
  mock.method(globalThis, 'fetch', async (url, options = {}) => {
    assert.equal(url, '/api/favorites')
    const method = options.method || 'GET'
    calls.push(method)
    if (failure?.method === method) return Response.json({ error: failure.message }, { status: 500 })
    const list = records.get(accountId) || []
    const body = options.body ? JSON.parse(options.body) : null
    if (method === 'GET') return Response.json(list)
    if (method === 'POST') {
      if (list.some((favorite) => favorite.id === body.recipeId)) {
        return Response.json({ error: 'Already added to your favorites.' }, { status: 409 })
      }
      const favorite = { ...recipe, note: '' }
      records.set(accountId, [...list, favorite])
      return Response.json(favorite, { status: 201 })
    }
    if (method === 'PUT') {
      const favorite = { ...list.find((item) => item.id === body.recipeId), note: body.note }
      records.set(accountId, list.map((item) => item.id === favorite.id ? favorite : item))
      return Response.json(favorite)
    }
    records.set(accountId, list.filter((item) => item.id !== body.recipeId))
    return Response.json({ success: true, recipeId: body.recipeId })
  })
})

afterEach(() => { cleanup(); client.clear(); mock.restoreAll() })
after(() => dom.window.close())

async function save() {
  const button = await screen.findByRole('button', { name: 'Save favorite' })
  await user.click(button)
  await screen.findByText('Added to your favorites.')
}

test('saving visibly marks a favorite, fills the list, persists on remount, and removes from details', async () => {
  const view = render(app())
  await save()
  assert.ok(screen.getByText('Saved to favorites'))
  assert.ok(screen.getByRole('link', { name: 'View favorites' }))
  assert.ok(screen.getByRole('heading', { name: recipe.title }))
  view.unmount()
  client.clear()
  render(app())
  await screen.findByRole('button', { name: 'Remove favorite' })
  await user.click(screen.getByRole('button', { name: 'Remove favorite' }))
  await screen.findByText('Removed from your favorites.')
  assert.equal(screen.queryByRole('heading', { name: recipe.title }), null)
  assert.ok(screen.getByRole('button', { name: 'Save favorite' }))
  assert.equal(records.get(accountId).length, 0)
})

test('repeated adds show the duplicate message without sending another save', async () => {
  render(app())
  await save()
  await user.click(screen.getByRole('button', { name: 'Add again' }))
  await screen.findByRole('alert')
  assert.equal(screen.getByRole('alert').textContent, 'Already added to your favorites.')
  assert.equal(calls.filter((method) => method === 'POST').length, 1)
  assert.equal(records.get(accountId).length, 1)
})

test('a duplicate saved in another tab reports the conflict and refreshes the saved indicator', async () => {
  render(app())
  await screen.findByRole('button', { name: 'Save favorite' })
  records.set(accountId, [{ ...recipe, note: 'Original note' }])
  await user.click(screen.getByRole('button', { name: 'Save favorite' }))
  assert.equal((await screen.findByRole('alert')).textContent, 'Already added to your favorites.')
  assert.ok(screen.getByText('Saved to favorites'))
  assert.equal(screen.getByRole('textbox', { name: 'Personal note' }).value, 'Original note')
})

test('removing from the favorites list also clears the details indicator', async () => {
  render(app())
  await save()
  await user.click(screen.getByRole('button', { name: 'Remove', exact: true }))
  await screen.findByText('Removed from your favorites.')
  assert.equal(screen.queryByText('Saved to favorites'), null)
  assert.ok(screen.getByRole('button', { name: 'Save favorite' }))
})

test('failed saves show an error and never claim success', async () => {
  failure = { method: 'POST', message: 'Unable to save this favorite. Please try again.' }
  render(app())
  await user.click(await screen.findByRole('button', { name: 'Save favorite' }))
  assert.equal((await screen.findByRole('alert')).textContent, failure.message)
  assert.equal(screen.queryByText('Saved to favorites'), null)
  assert.equal(screen.queryByRole('heading', { name: recipe.title }), null)
})

test('failed list loads display errors and can be retried instead of showing a false empty list', async () => {
  failure = { method: 'GET', message: 'Unable to load your favorites. Please try again.' }
  records.set(accountId, [{ ...recipe, note: '' }])
  render(app())
  await screen.findAllByRole('alert')
  assert.equal(screen.queryByText(/No favorites yet/), null)
  failure = null
  await user.click(screen.getByRole('button', { name: 'Try again' }))
  await screen.findByRole('heading', { name: recipe.title })
  assert.equal(screen.queryByRole('alert'), null)
})

test('failed removal preserves the favorite and failed note saves preserve the draft', async () => {
  render(app())
  await save()
  failure = { method: 'DELETE', message: 'Unable to remove this favorite.' }
  await user.click(screen.getByRole('button', { name: 'Remove', exact: true }))
  await screen.findByText(failure.message)
  assert.ok(screen.getByText('Saved to favorites'))
  failure = { method: 'PUT', message: 'Unable to save your note.' }
  await user.type(screen.getByRole('textbox', { name: 'Personal note' }), 'Less salt')
  await user.click(screen.getByRole('button', { name: 'Save note' }))
  await screen.findByText(failure.message)
  assert.equal(screen.getByRole('textbox', { name: 'Personal note' }).value, 'Less salt')
  failure = null
  await user.click(screen.getByRole('button', { name: 'Save note' }))
  await screen.findByText('Note saved.')
  assert.equal(records.get(accountId)[0].note, 'Less salt')
})

test('switching accounts or signing out never displays the previous account\'s list', async () => {
  const view = render(app())
  await save()
  accountId = 'account-2'
  view.rerender(app())
  await screen.findByRole('button', { name: 'Save favorite' })
  assert.equal(screen.queryByRole('heading', { name: recipe.title }), null)
  accountId = null
  view.rerender(app())
  assert.ok(screen.getByRole('link', { name: 'Sign in to save' }))
  assert.equal(screen.queryByText('Saved to favorites'), null)
})

test('a canceled, stale list request cannot overwrite a newly saved favorite', async () => {
  render(app())
  await screen.findByRole('button', { name: 'Save favorite' })
  let resolveStale
  const originalFetch = globalThis.fetch
  mock.method(globalThis, 'fetch', (url, options) => options.method === 'GET'
    ? new Promise((resolve) => { resolveStale = resolve }) : originalFetch(url, options))
  let refresh
  await act(async () => { refresh = client.refetchQueries({ queryKey: ['favorites', accountId] }) })
  const stale = resolveStale
  await user.click(screen.getByRole('button', { name: 'Save favorite' }))
  await waitFor(() => assert.ok(screen.getByText('Saved to favorites')))
  await act(async () => { stale(Response.json([])); await refresh })
  assert.ok(screen.getByText('Saved to favorites'))
  await act(async () => { resolveStale(Response.json(records.get(accountId))) })
  await screen.findByText('Added to your favorites.')
})
