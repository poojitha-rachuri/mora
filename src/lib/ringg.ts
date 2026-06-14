const RINGG_BASE = 'https://api.ringg.ai/v1'
const API_KEY = process.env.RINGG_API_KEY!
const AGENT_ID = process.env.RINGG_AGENT_ID!
const FROM_NUMBER_ID = process.env.RINGG_FROM_NUMBER_ID!

async function ringgFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${RINGG_BASE}${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Ringg API ${path} ${res.status}: ${body}`)
  }
  return res.json()
}

export interface RinggContact {
  phone: string
  name?: string
  product_name?: string
  purchase_date?: string
  [key: string]: string | undefined
}

export async function createCampaign(name: string, contacts: RinggContact[]) {
  return ringgFetch('/campaigns', {
    method: 'POST',
    body: JSON.stringify({
      name,
      agent_id: AGENT_ID,
      from_number_id: FROM_NUMBER_ID,
      contacts: contacts.map(c => ({
        phone_number: c.phone,
        variables: {
          customer_name: c.name || 'Customer',
          product_name: c.product_name || '',
          purchase_date: c.purchase_date || '',
        },
      })),
    }),
  })
}

export async function startCampaign(ringgCampaignId: string) {
  return ringgFetch(`/campaigns/${ringgCampaignId}/start`, { method: 'POST' })
}

export async function registerWebhook(ringgCampaignId: string, webhookUrl: string) {
  return ringgFetch(`/campaigns/${ringgCampaignId}/webhook`, {
    method: 'POST',
    body: JSON.stringify({ url: webhookUrl, events: ['call_started', 'call_completed', 'all_processing_completed'] }),
  })
}

export async function getCampaignStatus(ringgCampaignId: string) {
  return ringgFetch(`/campaigns/${ringgCampaignId}`)
}
