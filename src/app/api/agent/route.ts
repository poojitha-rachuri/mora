import { NextRequest, NextResponse } from 'next/server'
import { buildRinggAgentConfig, buildAvaPrompt } from '@/lib/agent-config'

const RINGG_BASE = 'https://prod-api.ringg.ai/ca/api/v0'
const API_KEY = process.env.RINGG_API_KEY!
const AGENT_ID = process.env.RINGG_AGENT_ID!

async function ringgFetch(method: string, path: string, body?: Record<string, unknown>) {
  const res = await fetch(`${RINGG_BASE}${path}`, {
    method,
    headers: {
      'X-API-KEY': API_KEY,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    throw new Error(`Ringg ${method} ${path} ${res.status}: ${text}`)
  }
  return res.json()
}

// GET — fetch current agent config from Ringg.ai
export async function GET() {
  try {
    const agent = await ringgFetch('GET', '/agent/v1')
    return NextResponse.json({ agent })
  } catch (err) {
    // Return default local config if Ringg.ai fetch fails
    const defaultConfig = buildRinggAgentConfig('serum')
    return NextResponse.json({
      agent: { id: AGENT_ID, ...defaultConfig },
      _source: 'local_default',
      _error: (err as Error).message,
    })
  }
}

// PUT — push updated prompt + settings to Ringg.ai agent
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { system_prompt, category, voice, max_duration_seconds } = body

    const promptToUse = system_prompt || buildAvaPrompt({ category: category || 'serum' })

    const updated = await ringgFetch('PATCH', '/agent/v1', {
      agent_id: AGENT_ID,
      operation: 'edit_prompt',
      agent_prompt: promptToUse,
    })

    return NextResponse.json({ success: true, agent: updated })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

// POST — preview: generate prompt for a given category without pushing
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { category = 'serum', brand_name, product_name } = body
  const prompt = buildAvaPrompt({ category, brandName: brand_name, productName: product_name })
  return NextResponse.json({ prompt, category })
}
