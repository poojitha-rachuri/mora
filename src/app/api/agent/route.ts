import { NextRequest, NextResponse } from 'next/server'
import { buildRinggAgentConfig, buildAvaPrompt } from '@/lib/agent-config'

const RINGG_BASE = 'https://api.ringg.ai/v1'
const API_KEY = process.env.RINGG_API_KEY!
const AGENT_ID = process.env.RINGG_AGENT_ID!

async function ringgFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${RINGG_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Ringg ${path} ${res.status}: ${body}`)
  }
  return res.json()
}

// GET — fetch current agent config from Ringg.ai
export async function GET() {
  try {
    const agent = await ringgFetch(`/agents/${AGENT_ID}`)
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

// PUT — push updated prompt to Ringg.ai agent
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { system_prompt, category, voice, max_duration_seconds } = body

    const promptToUse = system_prompt || buildAvaPrompt({ category: category || 'serum' })

    const updated = await ringgFetch(`/agents/${AGENT_ID}`, {
      method: 'PUT',
      body: JSON.stringify({
        system_prompt: promptToUse,
        ...(voice && { voice }),
        ...(max_duration_seconds && { max_duration_seconds }),
      }),
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
