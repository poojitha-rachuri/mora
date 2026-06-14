export type CampaignStatus = 'draft' | 'active' | 'completed' | 'paused'
export type CallStatus = 'queued' | 'in_progress' | 'completed' | 'failed' | 'no_answer'
export type Sentiment = 'positive' | 'neutral' | 'negative'
export type RecommendedAction = 'escalate' | 'send_guide' | 'request_review' | 'repurchase_remind' | 'cross_sell' | 'churn_intervention'

export interface Campaign {
  id: string
  name: string
  product_name: string
  product_category: string
  brand_name: string
  status: CampaignStatus
  ringg_campaign_id?: string
  webhook_registered: boolean
  total_contacts: number
  calls_completed: number
  calls_failed: number
  created_at: string
  updated_at: string
}

export interface CallRecord {
  id: string
  campaign_id: string
  ringg_call_id?: string
  contact_phone?: string
  contact_name?: string
  status: CallStatus
  duration_seconds?: number
  recording_url?: string
  transcript?: TranscriptTurn[]
  sentiment?: Sentiment
  satisfaction_score?: number
  repurchase_intent?: boolean
  skin_type?: string
  hair_type?: string
  usage_frequency?: string
  primary_concern?: string
  outcome?: string
  issues_detected?: string[]
  education_gaps?: string[]
  recommended_action?: RecommendedAction
  claude_enrichment?: ClaudeEnrichment
  raw_ringg_data?: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface TranscriptTurn {
  speaker: 'agent' | 'customer'
  text: string
  timestamp?: number
}

export interface ClaudeEnrichment {
  soft_signals: string[]
  edge_cases: string[]
  contextual_notes: string
  action_rationale: string
}

export interface ProductIntelligence {
  id: string
  campaign_id: string
  call_record_id: string
  product_name: string
  skin_type?: string
  hair_type?: string
  satisfaction_overall?: number
  satisfaction_efficacy?: number
  satisfaction_texture?: number
  satisfaction_scent?: number
  satisfaction_packaging?: number
  satisfaction_value?: number
  repurchase_intent?: boolean
  nps_score?: number
  usage_duration_weeks?: number
  usage_frequency?: string
  noted_benefits?: string[]
  noted_issues?: string[]
  education_gaps?: string[]
  skin_concerns?: string[]
  climate?: string
  age_group?: string
  routine_complexity?: string
  outcome?: string
  insight_tags?: string[]
  created_at: string
}

export interface MarketplaceProduct {
  id: string
  product_name: string
  brand_name: string
  product_category: string
  image_url?: string
  price_inr?: number
  description?: string
  voice_trust_score: number
  verified_call_count: number
  avg_satisfaction_overall?: number
  avg_satisfaction_efficacy?: number
  avg_satisfaction_texture?: number
  avg_satisfaction_scent?: number
  avg_satisfaction_packaging?: number
  avg_satisfaction_value?: number
  repurchase_rate?: number
  nps_average?: number
  works_best_for: WorksFor[]
  may_not_suit: MayNotSuit[]
  insight_statements: InsightStatement[]
  common_qa: CommonQA[]
  top_issues: TopIssue[]
  skin_type_breakdown: Record<string, number>
  outcome_breakdown: Record<string, number>
  last_aggregated_at: string
}

export interface WorksFor {
  profile: string
  reason: string
  match_pct: number
}

export interface MayNotSuit {
  profile: string
  reason: string
}

export interface InsightStatement {
  text: string
  stat: string
  category: string
}

export interface CommonQA {
  question: string
  answer: string
  frequency: number
}

export interface TopIssue {
  issue: string
  frequency: number
  severity: 'low' | 'medium' | 'high'
}

export interface ConsumerProfile {
  skin_type: string
  hair_type: string
  concerns: string[]
  budget: string
  routine_complexity: string
  climate?: string
}
