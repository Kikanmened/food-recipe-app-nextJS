import { readFile } from 'node:fs/promises'
import nextEnv from '@next/env'
import { neon } from '@neondatabase/serverless'

nextEnv.loadEnvConfig(process.cwd())
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set')

const sql = neon(process.env.DATABASE_URL)
const migration = await readFile(new URL('../src/db/migrations/003-favorite-recipes.sql', import.meta.url), 'utf8')
await sql.transaction([sql.query("set local lock_timeout = '5s'"), sql.query(migration)])
console.log('Favorites table is ready. Existing recipes and favorites were preserved.')
