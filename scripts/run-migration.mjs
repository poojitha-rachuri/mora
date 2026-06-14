#!/usr/bin/env node
/**
 * Applies supabase/migrations/*.sql to the hosted Supabase project.
 * Requires SUPABASE_ACCESS_TOKEN env var (get one at https://supabase.com/dashboard/account/tokens).
 *
 * Usage:
 *   SUPABASE_ACCESS_TOKEN=<token> node scripts/run-migration.mjs
 *
 * Or add it to .env.local and run:
 *   node -e "require('fs').readFileSync('.env.local','utf8').split('\n').forEach(l=>{const[k,...v]=l.split('=');if(k)process.env[k]=v.join('=')})" scripts/run-migration.mjs
 */

import { readFileSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir = dirname(fileURLToPath(import.meta.url))
const PROJECT_REF = 'ksumoaquzhtbijxryjmn'
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN

if (!ACCESS_TOKEN) {
  console.error('\nError: SUPABASE_ACCESS_TOKEN is not set.')
  console.error('Get one at: https://supabase.com/dashboard/account/tokens')
  console.error('\nThen run:')
  console.error('  SUPABASE_ACCESS_TOKEN=<token> node scripts/run-migration.mjs\n')
  process.exit(1)
}

async function runQuery(sql) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Query failed (${res.status}): ${text}`)
  }
  return res.json()
}

async function main() {
  const migrationsDir = join(__dir, '..', 'supabase', 'migrations')
  const files = readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort()

  console.log(`\nApplying ${files.length} migration(s) to project ${PROJECT_REF}...\n`)

  for (const file of files) {
    const sql = readFileSync(join(migrationsDir, file), 'utf8')
    console.log(`  → ${file}`)
    try {
      await runQuery(sql)
      console.log(`    ✓ Applied`)
    } catch (err) {
      // If tables already exist, Postgres errors on "create table if not exists" only for
      // things that genuinely fail — log and continue.
      if (err.message.includes('already exists')) {
        console.log(`    ⚠ Already applied (skipped)`)
      } else {
        console.error(`    ✗ Error: ${err.message}`)
        process.exit(1)
      }
    }
  }

  // Check if we should also run seed data
  const seedFile = join(__dir, '..', 'supabase', 'seed.sql')
  try {
    const seed = readFileSync(seedFile, 'utf8')
    console.log('\n  → seed.sql')
    await runQuery(seed)
    console.log('    ✓ Seed data inserted')
  } catch (err) {
    if (!err.code && err.message.includes('ENOENT')) {
      // no seed file — ok
    } else {
      console.log(`    ⚠ Seed skipped: ${err.message}`)
    }
  }

  console.log('\nDatabase setup complete!\n')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
