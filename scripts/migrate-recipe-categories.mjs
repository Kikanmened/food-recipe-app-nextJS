import { readFile } from 'node:fs/promises'
import nextEnv from '@next/env'
import { neon } from '@neondatabase/serverless'

nextEnv.loadEnvConfig(process.cwd())
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set')

const sql = neon(process.env.DATABASE_URL)
const schema = await readFile(new URL('../src/db/migrations/001-recipe-category.sql', import.meta.url), 'utf8')
const seeds = await readFile(new URL('../src/db/migrations/002-seed-recipe-categories.sql', import.meta.url), 'utf8')

await sql.transaction([
  sql.query("set local lock_timeout = '5s'"),
  sql.query(schema),
  sql.query(seeds),
])
console.log('Recipe categories migrated. Existing unclassified recipes remain in Other.')
