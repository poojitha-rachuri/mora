-- MORA Database Schema
-- Run this in the Supabase SQL Editor

-- Brands table
CREATE TABLE IF NOT EXISTS brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES brands(id),
  brand_name TEXT NOT NULL,
  campaign_name TEXT NOT NULL,
  product_name TEXT NOT NULL,
  category TEXT,
  ringg_campaign_id TEXT,
  ringg_list_id TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'ongoing', 'completed', 'failed')),
  total_contacts INTEGER DEFAULT 0,
  completed_calls INTEGER DEFAULT 0,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Call records table
CREATE TABLE IF NOT EXISTS call_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  ringg_call_id TEXT UNIQUE,
  callee_name TEXT,
  phone_hash TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'no_answer', 'failed', 'voicemail')),
  call_duration INTEGER,
  recording_url TEXT,
  transcript_json JSONB,
  custom_analysis JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product intelligence table
CREATE TABLE IF NOT EXISTS product_intelligence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  call_record_id UUID REFERENCES call_records(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  brand_name TEXT NOT NULL,
  skin_type TEXT,
  hair_type TEXT,
  overall_sentiment TEXT CHECK (overall_sentiment IN ('positive', 'neutral', 'negative')),
  texture_score NUMERIC(3,1),
  effectiveness_score NUMERIC(3,1),
  fragrance_score NUMERIC(3,1),
  value_score NUMERIC(3,1),
  packaging_score NUMERIC(3,1),
  repurchase_intent TEXT CHECK (repurchase_intent IN ('definitely_yes', 'probably_yes', 'unsure', 'probably_no', 'definitely_no')),
  recommendation_likelihood INTEGER CHECK (recommendation_likelihood BETWEEN 0 AND 10),
  customer_segment TEXT,
  recommended_action TEXT,
  issues_reported JSONB DEFAULT '[]',
  usage_mistakes JSONB DEFAULT '[]',
  unanswered_questions_json JSONB DEFAULT '[]',
  adverse_reaction_flag BOOLEAN DEFAULT FALSE,
  non_usage_reason TEXT,
  enriched_context TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Marketplace products table
CREATE TABLE IF NOT EXISTS marketplace_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name TEXT NOT NULL,
  brand_name TEXT NOT NULL,
  category TEXT,
  total_verified_conversations INTEGER DEFAULT 0,
  voice_trust_score NUMERIC(5,2) DEFAULT 0,
  avg_texture NUMERIC(3,1),
  avg_effectiveness NUMERIC(3,1),
  avg_fragrance NUMERIC(3,1),
  avg_value NUMERIC(3,1),
  avg_packaging NUMERIC(3,1),
  sentiment_distribution JSONB DEFAULT '{"positive":0,"neutral":0,"negative":0}',
  repurchase_distribution JSONB DEFAULT '{"definitely_yes":0,"probably_yes":0,"unsure":0,"probably_no":0,"definitely_no":0}',
  works_best_for JSONB DEFAULT '[]',
  not_ideal_for JSONB DEFAULT '[]',
  top_insights JSONB DEFAULT '[]',
  common_questions JSONB DEFAULT '[]',
  education_gaps JSONB DEFAULT '[]',
  issue_summary JSONB DEFAULT '[]',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_name, brand_name)
);

-- Consumer profiles table
CREATE TABLE IF NOT EXISTS consumer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT UNIQUE,
  skin_type TEXT,
  hair_type TEXT,
  primary_concerns JSONB DEFAULT '[]',
  budget_range TEXT,
  routine_complexity TEXT,
  city TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Webhook events deduplication table
CREATE TABLE IF NOT EXISTS webhook_events (
  call_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  received_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (call_id, event_type)
);
