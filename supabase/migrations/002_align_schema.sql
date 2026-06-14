-- Migration 002: Align schema with application types
-- Drops old tables (only seed data, no real call data yet) and recreates
-- with column names that match db.ts / types.ts exactly.

-- ── Drop old tables ────────────────────────────────────────────────────────
drop table if exists product_intelligence cascade;
drop table if exists call_records cascade;
drop table if exists marketplace_products cascade;
drop table if exists campaigns cascade;

-- ── campaigns ──────────────────────────────────────────────────────────────
create table campaigns (
  id              uuid primary key default gen_random_uuid(),
  brand_name      text not null,
  campaign_name   text not null,
  product_name    text not null,
  category        text,
  ringg_campaign_id text,
  ringg_list_id   text,
  status          text not null default 'draft'
                    check (status in ('draft','ongoing','completed','failed')),
  total_contacts  integer not null default 0,
  completed_calls integer not null default 0,
  start_time      timestamptz,
  end_time        timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ── call_records ───────────────────────────────────────────────────────────
create table call_records (
  id              uuid primary key default gen_random_uuid(),
  campaign_id     uuid references campaigns(id) on delete cascade,
  ringg_call_id   text unique,
  callee_name     text,
  phone_hash      text not null,
  status          text not null default 'pending'
                    check (status in ('pending','completed','no_answer','failed','voicemail')),
  call_duration   integer,
  recording_url   text,
  transcript_json jsonb,
  custom_analysis jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ── product_intelligence ───────────────────────────────────────────────────
create table product_intelligence (
  id                      uuid primary key default gen_random_uuid(),
  campaign_id             uuid references campaigns(id) on delete cascade,
  call_record_id          uuid references call_records(id) on delete cascade,
  product_name            text not null,
  brand_name              text not null,
  skin_type               text,
  hair_type               text,
  overall_sentiment       text check (overall_sentiment in ('positive','neutral','negative')),
  texture_score           numeric(3,1),
  effectiveness_score     numeric(3,1),
  fragrance_score         numeric(3,1),
  value_score             numeric(3,1),
  packaging_score         numeric(3,1),
  repurchase_intent       text check (repurchase_intent in
                            ('definitely_yes','probably_yes','unsure','probably_no','definitely_no')),
  recommendation_likelihood numeric(4,1),
  customer_segment        text,
  recommended_action      text,
  issues_reported         jsonb default '[]',
  usage_mistakes          jsonb default '[]',
  unanswered_questions_json jsonb default '[]',
  adverse_reaction_flag   boolean default false,
  non_usage_reason        text,
  enriched_context        text,
  created_at              timestamptz not null default now()
);

-- ── marketplace_products ───────────────────────────────────────────────────
create table marketplace_products (
  id                          uuid primary key default gen_random_uuid(),
  product_name                text not null,
  brand_name                  text not null,
  category                    text,
  total_verified_conversations integer not null default 0,
  voice_trust_score           numeric(5,2) not null default 0,
  avg_texture                 numeric(3,1),
  avg_effectiveness           numeric(3,1),
  avg_fragrance               numeric(3,1),
  avg_value                   numeric(3,1),
  avg_packaging               numeric(3,1),
  sentiment_distribution      jsonb not null default '{"positive":0,"neutral":0,"negative":0}',
  repurchase_distribution     jsonb not null default
                                '{"definitely_yes":0,"probably_yes":0,"unsure":0,"probably_no":0,"definitely_no":0}',
  works_best_for              jsonb not null default '[]',
  not_ideal_for               jsonb not null default '[]',
  top_insights                jsonb not null default '[]',
  common_questions            jsonb not null default '[]',
  education_gaps              jsonb not null default '[]',
  issue_summary               jsonb not null default '[]',
  updated_at                  timestamptz not null default now(),
  unique (product_name, brand_name)
);

-- ── webhook_events (dedup table) ───────────────────────────────────────────
create table webhook_events (
  call_id     text not null,
  event_type  text not null,
  received_at timestamptz not null default now(),
  primary key (call_id, event_type)
);

-- ── Indexes ────────────────────────────────────────────────────────────────
create index idx_call_records_campaign    on call_records(campaign_id);
create index idx_call_records_ringg_id   on call_records(ringg_call_id);
create index idx_pi_campaign             on product_intelligence(campaign_id);
create index idx_pi_product_brand        on product_intelligence(product_name, brand_name);
create index idx_mp_voice_trust          on marketplace_products(voice_trust_score desc);
create index idx_webhook_events_received on webhook_events(received_at);

-- ── updated_at trigger ─────────────────────────────────────────────────────
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger campaigns_updated_at
  before update on campaigns
  for each row execute function set_updated_at();

create trigger call_records_updated_at
  before update on call_records
  for each row execute function set_updated_at();

create trigger marketplace_products_updated_at
  before update on marketplace_products
  for each row execute function set_updated_at();
