import { createServerClient } from './supabase';
import type { Campaign, CallRecord, ProductIntelligence, MarketplaceProduct, CampaignAnalytics } from './types';

function db() {
  return createServerClient();
}

// ── Campaigns ──────────────────────────────────────────────────────────────

export async function getCampaigns(): Promise<Campaign[]> {
  const { data, error } = await db()
    .from('campaigns')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getCampaign(id: string): Promise<Campaign | null> {
  const { data, error } = await db()
    .from('campaigns')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function createCampaign(
  input: Omit<Campaign, 'id' | 'created_at' | 'updated_at' | 'total_contacts' | 'completed_calls' | 'status'>
): Promise<Campaign> {
  const { data, error } = await db()
    .from('campaigns')
    .insert({ ...input, status: 'draft', total_contacts: 0, completed_calls: 0 })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateCampaign(id: string, patch: Partial<Campaign>): Promise<Campaign> {
  const { data, error } = await db()
    .from('campaigns')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ── Call Records ───────────────────────────────────────────────────────────

export async function createCallRecord(
  input: Omit<CallRecord, 'id' | 'created_at' | 'updated_at'>
): Promise<CallRecord> {
  const { data, error } = await db()
    .from('call_records')
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function upsertCallRecord(
  input: Partial<CallRecord> & { ringg_call_id: string; phone_hash: string; campaign_id: string }
): Promise<CallRecord> {
  const { data, error } = await db()
    .from('call_records')
    .upsert(
      { ...input, updated_at: new Date().toISOString() },
      { onConflict: 'ringg_call_id' }
    )
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getCallsByCampaign(
  campaignId: string,
  limit = 50,
  offset = 0
): Promise<CallRecord[]> {
  const { data, error } = await db()
    .from('call_records')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw error;
  return data ?? [];
}

// ── Product Intelligence ───────────────────────────────────────────────────

export async function insertProductIntelligence(
  input: Omit<ProductIntelligence, 'id' | 'created_at'>
): Promise<ProductIntelligence> {
  const { data, error } = await db()
    .from('product_intelligence')
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getProductIntelligenceForCampaign(
  campaignId: string
): Promise<ProductIntelligence[]> {
  const { data, error } = await db()
    .from('product_intelligence')
    .select('*')
    .eq('campaign_id', campaignId);
  if (error) throw error;
  return data ?? [];
}

export async function getProductIntelligenceForProduct(
  productName: string,
  brandName: string
): Promise<ProductIntelligence[]> {
  const { data, error } = await db()
    .from('product_intelligence')
    .select('*')
    .eq('product_name', productName)
    .eq('brand_name', brandName);
  if (error) throw error;
  return data ?? [];
}

// ── Campaign Analytics ─────────────────────────────────────────────────────

export async function getCampaignAnalyticsSummary(
  campaignId: string
): Promise<CampaignAnalytics> {
  const [campaign, rows] = await Promise.all([
    getCampaign(campaignId),
    getProductIntelligenceForCampaign(campaignId),
  ]);

  const total = rows.length;
  const completed = rows.filter((r) => r.overall_sentiment !== undefined).length;

  const avgScore = (field: keyof ProductIntelligence) => {
    const vals = rows.map((r) => r[field] as number).filter((v) => v != null);
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  };

  const countSentiment = (s: string) => rows.filter((r) => r.overall_sentiment === s).length;
  const countRepurchase = (v: string) => rows.filter((r) => r.repurchase_intent === v).length;

  const allIssues: Array<{ issue: string; severity: string }> = rows.flatMap(
    (r) => (r.issues_reported as Array<{ issue: string; severity: string }> | undefined) ?? []
  );
  const issueMap: Record<string, { count: number; severity: string }> = {};
  for (const { issue, severity } of allIssues) {
    issueMap[issue] = { count: (issueMap[issue]?.count ?? 0) + 1, severity };
  }
  const topIssues = Object.entries(issueMap)
    .map(([issue, { count, severity }]) => ({ issue, count, severity }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const segmentMap: Record<string, number> = {};
  for (const r of rows) {
    if (r.customer_segment) {
      segmentMap[r.customer_segment] = (segmentMap[r.customer_segment] ?? 0) + 1;
    }
  }

  const allMistakes: string[] = rows.flatMap((r) => (r.usage_mistakes as string[] | undefined) ?? []);
  const mistakeMap: Record<string, number> = {};
  for (const m of allMistakes) {
    mistakeMap[m] = (mistakeMap[m] ?? 0) + 1;
  }
  const educationGaps = Object.entries(mistakeMap)
    .map(([mistake, count]) => ({ mistake, percentage: total ? Math.round((count / total) * 100) : 0 }))
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 5);

  const avgDuration = rows
    .map((r) => {
      const rec = r as unknown as { call_duration?: number };
      return rec.call_duration;
    })
    .filter((d): d is number => d != null);
  const avgCallDuration = avgDuration.length
    ? avgDuration.reduce((a, b) => a + b, 0) / avgDuration.length
    : 0;

  const npsScores = rows
    .map((r) => r.recommendation_likelihood)
    .filter((v): v is number => v != null);
  const nps = npsScores.length
    ? (npsScores.reduce((a, b) => a + b, 0) / npsScores.length) * 10
    : 0;

  const rowsWithIssues = rows.filter(
    (r) => ((r.issues_reported as unknown[]) ?? []).length > 0
  ).length;

  return {
    campaign_id: campaignId,
    total_calls: campaign?.total_contacts ?? total,
    completed_calls: completed,
    completion_rate: total ? completed / total : 0,
    avg_call_duration: Math.round(avgCallDuration),
    nps: Math.round(nps),
    issue_detection_rate: total ? rowsWithIssues / total : 0,
    avg_satisfaction: {
      texture: Number(avgScore('texture_score').toFixed(1)),
      effectiveness: Number(avgScore('effectiveness_score').toFixed(1)),
      fragrance: Number(avgScore('fragrance_score').toFixed(1)),
      value: Number(avgScore('value_score').toFixed(1)),
      packaging: Number(avgScore('packaging_score').toFixed(1)),
    },
    sentiment_distribution: {
      positive: countSentiment('positive'),
      neutral: countSentiment('neutral'),
      negative: countSentiment('negative'),
    },
    repurchase_distribution: {
      definitely_yes: countRepurchase('definitely_yes'),
      probably_yes: countRepurchase('probably_yes'),
      unsure: countRepurchase('unsure'),
      probably_no: countRepurchase('probably_no'),
      definitely_no: countRepurchase('definitely_no'),
    },
    top_issues: topIssues,
    customer_segments: segmentMap,
    education_gaps: educationGaps,
  };
}

// ── Marketplace Products ───────────────────────────────────────────────────

export async function upsertMarketplaceProduct(
  input: Partial<MarketplaceProduct> & { product_name: string; brand_name: string }
): Promise<MarketplaceProduct> {
  const { data, error } = await db()
    .from('marketplace_products')
    .upsert(
      { ...input, updated_at: new Date().toISOString() },
      { onConflict: 'product_name,brand_name' }
    )
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getMarketplaceProduct(id: string): Promise<MarketplaceProduct | null> {
  const { data, error } = await db()
    .from('marketplace_products')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getAllMarketplaceProducts(): Promise<MarketplaceProduct[]> {
  const { data, error } = await db()
    .from('marketplace_products')
    .select('*')
    .order('voice_trust_score', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// ── Webhook Events ─────────────────────────────────────────────────────────

export async function recordWebhookEvent(
  callId: string,
  eventType: string
): Promise<boolean> {
  const { error } = await db()
    .from('webhook_events')
    .insert({ call_id: callId, event_type: eventType });
  if (error) {
    // Duplicate key = already processed
    if (error.code === '23505') return false;
    throw error;
  }
  return true;
}
