-- TrueGlow Database Schema

-- Campaigns table
create table if not exists campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  product_name text not null,
  product_category text not null,
  brand_name text not null,
  status text not null default 'draft', -- draft, active, completed, paused
  ringg_campaign_id text,
  webhook_registered boolean default false,
  total_contacts integer default 0,
  calls_completed integer default 0,
  calls_failed integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Call records table
create table if not exists call_records (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references campaigns(id) on delete cascade,
  ringg_call_id text unique,
  contact_phone text,
  contact_name text,
  status text not null default 'queued', -- queued, in_progress, completed, failed, no_answer
  duration_seconds integer,
  recording_url text,
  transcript jsonb,
  sentiment text, -- positive, neutral, negative
  satisfaction_score numeric(3,1),
  repurchase_intent boolean,
  skin_type text,
  hair_type text,
  usage_frequency text,
  primary_concern text,
  outcome text, -- satisfied, issue_reported, churned, gift_buyer, non_user
  issues_detected text[],
  education_gaps text[],
  recommended_action text, -- escalate, send_guide, request_review, repurchase_remind, cross_sell, churn_intervention
  claude_enrichment jsonb,
  raw_ringg_data jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Product intelligence table (extracted from calls)
create table if not exists product_intelligence (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references campaigns(id) on delete cascade,
  call_record_id uuid references call_records(id) on delete cascade,
  product_name text not null,
  skin_type text,
  hair_type text,
  satisfaction_overall numeric(3,1),
  satisfaction_efficacy numeric(3,1),
  satisfaction_texture numeric(3,1),
  satisfaction_scent numeric(3,1),
  satisfaction_packaging numeric(3,1),
  satisfaction_value numeric(3,1),
  repurchase_intent boolean,
  nps_score integer, -- 0-10
  usage_duration_weeks integer,
  usage_frequency text,
  noted_benefits text[],
  noted_issues text[],
  education_gaps text[],
  skin_concerns text[],
  climate text,
  age_group text,
  routine_complexity text,
  outcome text,
  insight_tags text[],
  created_at timestamptz default now()
);

-- Marketplace products table (aggregated)
create table if not exists marketplace_products (
  id uuid primary key default gen_random_uuid(),
  product_name text not null,
  brand_name text not null,
  product_category text not null,
  image_url text,
  price_inr numeric(8,2),
  description text,
  voice_trust_score integer default 0, -- 0-100
  verified_call_count integer default 0,
  avg_satisfaction_overall numeric(3,1),
  avg_satisfaction_efficacy numeric(3,1),
  avg_satisfaction_texture numeric(3,1),
  avg_satisfaction_scent numeric(3,1),
  avg_satisfaction_packaging numeric(3,1),
  avg_satisfaction_value numeric(3,1),
  repurchase_rate numeric(5,2),
  nps_average numeric(4,1),
  works_best_for jsonb default '[]',   -- [{profile, reason, match_pct}]
  may_not_suit jsonb default '[]',     -- [{profile, reason}]
  insight_statements jsonb default '[]', -- [{text, stat, category}]
  common_qa jsonb default '[]',        -- [{question, answer, frequency}]
  top_issues jsonb default '[]',       -- [{issue, frequency, severity}]
  skin_type_breakdown jsonb default '{}',
  outcome_breakdown jsonb default '{}',
  last_aggregated_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes
create index if not exists idx_call_records_campaign on call_records(campaign_id);
create index if not exists idx_call_records_ringg_id on call_records(ringg_call_id);
create index if not exists idx_product_intelligence_campaign on product_intelligence(campaign_id);
create index if not exists idx_product_intelligence_product on product_intelligence(product_name);
create index if not exists idx_marketplace_products_name on marketplace_products(product_name);

-- Update timestamp trigger
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger campaigns_updated_at before update on campaigns
  for each row execute function update_updated_at();

create trigger call_records_updated_at before update on call_records
  for each row execute function update_updated_at();

create trigger marketplace_products_updated_at before update on marketplace_products
  for each row execute function update_updated_at();
