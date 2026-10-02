import assert from 'node:assert/strict'
import { after, beforeEach, mock, test } from 'node:test'

const signOut = mock.fn()
mock.module('@neondatabase/auth/next', {
  namedExports: { createAuthClient: () => ({ signOut }) },
})
const { signOutAndRedirect } = await import('../src/lib/auth/client.js')
const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window')
let events

beforeEach(() => {
  events = []
  signOut.mock.resetCalls()
  signOut.mock.mockImplementation(async () => {
    events.push('session revoked')
    return { data: { success: true }, error: null }
  })
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      localStorage: { removeItem: (key) => events.push(`remove ${key}`) },
      location: { replace: (url) => events.push(`navigate ${url}`) },
    },
  })
})

after(() => {
  if (originalWindow) Object.defineProperty(globalThis, 'window', originalWindow)
  else delete globalThis.window
})

test('successful logout clears favorites and replaces the page only after revocation', async () => {
  await signOutAndRedirect()
  assert.equal(signOut.mock.callCount(), 1)
  assert.deepEqual(events, [
    'session revoked',
    'remove recipe-book-favorites',
    'navigate /sign-in',
  ])
})

test('a returned auth error does not pretend logout succeeded', async () => {
  signOut.mock.mockImplementation(async () => ({ error: { message: 'Service unavailable' } }))
  await assert.rejects(signOutAndRedirect(), /Unable to sign out/)
  assert.deepEqual(events, [])
})

test('a network failure does not redirect or clear the current account state', async () => {
  signOut.mock.mockImplementation(async () => { throw new Error('Network unavailable') })
  await assert.rejects(signOutAndRedirect(), /Network unavailable/)
  assert.deepEqual(events, [])
})

test('blocked local storage does not prevent the sign-in redirect', async () => {
  window.localStorage.removeItem = () => { throw new Error('Storage blocked') }
  await signOutAndRedirect()
  assert.deepEqual(events, ['session revoked', 'navigate /sign-in'])
})
