// Database row types

export interface Brand {
  id: string;
  name: string;
  email?: string;
  created_at: string;
}

export interface Campaign {
  id: string;
  brand_id?: string;
  brand_name: string;
  campaign_name: string;
  product_name: string;
  category?: string;
  ringg_campaign_id?: string;
  ringg_list_id?: string;
  status: 'draft' | 'ongoing' | 'completed' | 'failed';
  total_contacts: number;
  completed_calls: number;
  start_time?: string;
  end_time?: string;
  created_at: string;
  updated_at: string;
}

export interface CallRecord {
  id: string;
  campaign_id: string;
  ringg_call_id?: string;
  callee_name?: string;
  phone_hash: string;
  status: 'pending' | 'completed' | 'no_answer' | 'failed' | 'voicemail';
  call_duration?: number;
  recording_url?: string;
  transcript_json?: TranscriptTurn[];
  custom_analysis?: CustomAnalysis;
  created_at: string;
  updated_at: string;
}

export interface TranscriptTurn {
  role: 'bot' | 'user';
  content: string;
  timestamp?: number;
}

export interface CustomAnalysis {
  skin_type?: string;
  hair_type?: string;
  overall_sentiment?: 'positive' | 'neutral' | 'negative';
  texture_score?: number;
  effectiveness_score?: number;
  fragrance_score?: number;
  value_score?: number;
  packaging_score?: number;
  repurchase_intent?: 'definitely_yes' | 'probably_yes' | 'unsure' | 'probably_no' | 'definitely_no';
  recommendation_likelihood?: number;
  customer_segment?: string;
  recommended_action?: string;
  issues_reported?: Array<{ issue: string; severity: 'mild' | 'moderate' | 'severe' }>;
  usage_mistakes?: string[];
  unanswered_questions?: string[];
  adverse_reaction_flag?: boolean;
  non_usage_reason?: string;
}

export interface ProductIntelligence {
  id: string;
  campaign_id: string;
  call_record_id: string;
  product_name: string;
  brand_name: string;
  skin_type?: string;
  hair_type?: string;
  overall_sentiment?: 'positive' | 'neutral' | 'negative';
  texture_score?: number;
  effectiveness_score?: number;
  fragrance_score?: number;
  value_score?: number;
  packaging_score?: number;
  repurchase_intent?: 'definitely_yes' | 'probably_yes' | 'unsure' | 'probably_no' | 'definitely_no';
  recommendation_likelihood?: number;
  customer_segment?: string;
  recommended_action?: string;
  issues_reported?: Array<{ issue: string; severity: 'mild' | 'moderate' | 'severe' }>;
  usage_mistakes?: string[];
  unanswered_questions_json?: string[];
  adverse_reaction_flag?: boolean;
  non_usage_reason?: string;
  enriched_context?: string;
  created_at: string;
}

export interface MarketplaceProduct {
  id: string;
  product_name: string;
  brand_name: string;
  category?: string;
  total_verified_conversations: number;
  voice_trust_score: number;
  avg_texture?: number;
  avg_effectiveness?: number;
  avg_fragrance?: number;
  avg_value?: number;
  avg_packaging?: number;
  sentiment_distribution: { positive: number; neutral: number; negative: number };
  repurchase_distribution: {
    definitely_yes: number;
    probably_yes: number;
    unsure: number;
    probably_no: number;
    definitely_no: number;
  };
  works_best_for: Array<{ profile: string; satisfaction: number; note: string }>;
  not_ideal_for: Array<{ profile: string; reason: string }>;
  top_insights: string[];
  common_questions: Array<{ question: string; answer: string }>;
  education_gaps: Array<{ mistake: string; percentage: number; tip: string }>;
  issue_summary: Array<{ issue: string; percentage: number; severity: 'mild' | 'moderate' | 'severe'; is_dealbreaker: boolean }>;
  updated_at: string;
}

export interface ConsumerProfile {
  skin_type?: string;
  hair_type?: string;
  primary_concerns: string[];
  budget_range?: string;
  routine_complexity?: string;
  city?: string;
}

export interface CampaignAnalytics {
  campaign_id: string;
  total_calls: number;
  completed_calls: number;
  completion_rate: number;
  avg_call_duration: number;
  nps: number;
  issue_detection_rate: number;
  avg_satisfaction: {
    texture: number;
    effectiveness: number;
    fragrance: number;
    value: number;
    packaging: number;
  };
  sentiment_distribution: { positive: number; neutral: number; negative: number };
  repurchase_distribution: {
    definitely_yes: number;
    probably_yes: number;
    unsure: number;
    probably_no: number;
    definitely_no: number;
  };
  top_issues: Array<{ issue: string; count: number; severity: string }>;
  customer_segments: Record<string, number>;
  education_gaps: Array<{ mistake: string; percentage: number }>;
}

export interface WebhookEvent {
  call_id: string;
  event_type: string;
  received_at: string;
}
