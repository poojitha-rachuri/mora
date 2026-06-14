import OpenAI from 'openai'

const client = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    'X-Title': 'TrueGlow',
  },
})

const MODEL = process.env.OPENROUTER_MODEL || 'anthropic/claude-sonnet-4-5'

export async function enrichTranscript(
  transcript: Array<{ speaker: string; text: string }>,
  productName: string,
  productCategory: string
) {
  const transcriptText = transcript
    .map(t => `${t.speaker === 'agent' ? 'Ava (Agent)' : 'Customer'}: ${t.text}`)
    .join('\n')

  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: 'system',
        content: `You are a beauty industry analyst extracting deep insights from post-purchase feedback calls. Focus on soft signals, edge cases, and contextual nuance that structured fields miss.`,
      },
      {
        role: 'user',
        content: `Product: ${productName} (${productCategory})

Transcript:
${transcriptText}

Extract:
1. soft_signals: 3-5 subtle emotional or behavioral cues not captured in structured fields
2. edge_cases: any unusual usage patterns, adverse reactions, or atypical contexts
3. contextual_notes: 1-2 sentences of contextual nuance about this buyer's experience
4. action_rationale: why the recommended action makes sense for this specific buyer

Return valid JSON: { "soft_signals": [], "edge_cases": [], "contextual_notes": "", "action_rationale": "" }`,
      },
    ],
    response_format: { type: 'json_object' },
    max_tokens: 600,
  })

  return JSON.parse(response.choices[0].message.content || '{}')
}

export async function generateInsightStatements(
  productName: string,
  aggregatedData: Record<string, unknown>
) {
  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: 'system',
        content: `You are a beauty brand analyst. Generate human-readable insight statements from aggregated post-purchase voice feedback data. Statements should be specific, credible, and highlight real data points.`,
      },
      {
        role: 'user',
        content: `Product: ${productName}
Aggregated Data: ${JSON.stringify(aggregatedData, null, 2)}

Generate 6-8 insight statements like:
- "78% of oily-skin users saw reduced shine within 2 weeks"
- "Buyers 25-34 rate texture 4.7/5 vs 3.9 for 35+"

Return JSON: { "statements": [{ "text": "...", "stat": "78%", "category": "efficacy|texture|value|usage|segment" }] }`,
      },
    ],
    response_format: { type: 'json_object' },
    max_tokens: 800,
  })

  const parsed = JSON.parse(response.choices[0].message.content || '{"statements":[]}')
  return parsed.statements || []
}

export async function generateRecommendationReasoning(
  profile: Record<string, unknown>,
  products: Array<{ name: string; data: Record<string, unknown> }>
) {
  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: 'system',
        content: `You are a personalized beauty advisor. Given a consumer's skin/hair profile and voice-verified product data from real buyers with similar profiles, explain why each product fits or doesn't fit this specific consumer. Be specific and reference real data from calls.`,
      },
      {
        role: 'user',
        content: `Consumer Profile: ${JSON.stringify(profile, null, 2)}

Products to evaluate:
${products.map((p, i) => `${i + 1}. ${p.name}: ${JSON.stringify(p.data)}`).join('\n\n')}

For each product return a "why_this_fits" paragraph (2-3 sentences) referencing specific voice data. Be honest — if it's a poor fit, say so.

Return JSON: { "recommendations": [{ "product_name": "...", "match_score": 0-100, "why_this_fits": "...", "caveat": "..." }] }`,
      },
    ],
    response_format: { type: 'json_object' },
    max_tokens: 1200,
  })

  const parsed = JSON.parse(response.choices[0].message.content || '{"recommendations":[]}')
  return parsed.recommendations || []
}
