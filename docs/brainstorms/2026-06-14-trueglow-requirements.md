# MORA: Voice-Verified Post-Purchase Feedback — Requirements

Created: 2026-06-14

---

## Summary

MORA is a full-stack web application that enables beauty and personal care brands to run AI voice feedback campaigns on recent buyers via Ringg.ai, then surfaces anonymized, aggregated insights on a consumer-facing product marketplace. The system has two independent surfaces: a B2B Brand Dashboard for campaign management and analytics, and a B2C Consumer Marketplace for voice-verified product intelligence.

---

## Problem Frame

Beauty brands cannot get deep, verified, structured post-purchase feedback at scale. Star ratings are shallow; written reviews are sparse and incentive-distorted. There is no scalable mechanism to collect nuanced, expert-probed product experience data from real buyers — data that distinguishes oily-skin satisfaction from dry-skin satisfaction, or identifies usage mistakes that cause silent churn.

Consumers face the mirror problem: product pages on Amazon and Nykaa show aggregate stars but not "does this work for my skin type, with my routine, in my climate?"

---

## Actors

- **Brand Operator** — uploads buyer CSV, configures and launches voice campaigns, views structured analytics and action recommendations
- **Consumer** — browses marketplace, provides skin/hair profile, receives voice-data-backed product recommendations
- **Voice Agent (Ava)** — outbound Ringg.ai AI agent that conducts post-purchase feedback calls with beauty-domain expertise

---

## Requirements

### Brand Dashboard (B2B)

R1. Brand operator can upload a buyer CSV and see a preview of mapped fields before launching a campaign.

R2. System auto-detects product category from the product_name column and shows the recommended callback timing window.

R3. Brand operator can launch a Ringg.ai campaign (creates campaign, starts calls, registers webhook) from the dashboard UI.

R4. Campaign analytics page shows: satisfaction radar chart (5 dimensions), sentiment distribution, repurchase intent, top issues, customer segment distribution, education gaps, and key stat cards (completion rate, NPS, issue detection rate).

R5. Call records page shows all calls with status, duration, sentiment, and segment; individual records are expandable to show full transcript, audio player, and extracted structured fields.

R6. Action engine groups customers by recommended action (escalate, send guide, request review, repurchase remind, cross-sell, churn intervention) and allows bulk export.

R7. Dashboard must show real structured data derived from real Ringg.ai call data (not fabricated).

### Consumer Marketplace (B2C)

R8. Product page shows: Voice Trust Score (0-100, verified conversation count), 5-dimension satisfaction breakdown, "Works Best For" profiles, "May Not Be Ideal For" profiles, aggregated buyer insight statements, common questions answered by real buyers, issue transparency section, and repurchase signal visualization.

R9. Consumer can set a profile (skin type, hair type, concerns, budget, routine complexity) and receive matched product cards with Claude-generated "why this fits you" reasoning.

R10. Marketplace has no brand-editable content — all data derives from voice call analysis.

### Data Pipeline

R11. Ringg.ai webhook handler receives `call_started`, `call_completed`, and `all_processing_completed` events; responds 2xx immediately and processes asynchronously.

R12. On `all_processing_completed`, the system extracts `custom_analysis` fields into the `product_intelligence` table and recomputes `marketplace_products` aggregates.

R13. Claude enriches transcripts post-webhook to surface insights beyond Ringg.ai's structured extraction (soft signals, edge cases, contextual nuance).

R14. Claude generates human-readable marketplace insight statements (e.g. "78% of oily-skin users saw reduced shine in 2 weeks") from aggregated `product_intelligence` data.

R15. Claude generates "why this product for your profile" reasoning for the recommendations page given consumer profile + product voice data.

### Demo Readiness

R16. Seed data for two products exists and is loadable via a script: Minimalist 10% Niacinamide Serum (~30-50 records) and Plum Green Tea Anti-Acne Face Wash (~30-50 records), with realistic transcript JSON, product_intelligence rows, and pre-computed marketplace_products aggregates.

R17. The live pipeline must be demonstrable: CSV upload → Ringg.ai campaign → webhook → dashboard update → marketplace update.

---

## Key Technical Decisions

- **Database**: Supabase hosted PostgreSQL (free tier, Vercel-native integration, no local setup)
- **Claude API role**: Three layers — (1) transcript enrichment after `all_processing_completed`, (2) narrative generation in `marketplace-aggregator.ts`, (3) recommendation reasoning in `recommendations.ts`
- **Voice engine**: Ringg.ai exclusively — all outbound calls, transcripts, recordings, webhook events
- **Scope boundary**: P0 pages only for hackathon demo; P1 pages explicitly deferred

---

## Success Criteria (Hackathon Scoring)

- **Job-to-be-done (30pts)**: Voice agent completes full feedback collection — usage discovery → experience capture → issue probing → outcome determination → action tagging — and the structured data lands in the dashboard
- **Domain Nuance (30pts)**: Agent uses beauty-specific terminology and asks category-specific questions (serum call differs from shampoo call); handles objections and edge cases (adverse reactions, non-users, gift buyers)
- **Business Impact (20pts)**: Dashboard shows credible business metrics with percentages and estimated impact ("23% of buyers reported usage confusion → estimated 8-12% reduction in silent churn")
- **Memory & Context (20pts)**: Agent references earlier context within calls; dashboard shows the full context journey; marketplace inherits structured profile data from calls

---

## Scope Boundaries

### P0 — In scope for hackathon demo
- `/brand/campaigns/new` — Campaign creation with CSV upload and Ringg.ai launch
- `/brand/campaigns/[id]/analytics` — Campaign analytics dashboard
- `/brand/campaigns/[id]/calls` — Call records with transcript viewer and audio player
- `/brand/campaigns/[id]/actions` — Action engine with customer grouping
- `/marketplace/products/[id]` — Product page with voice intelligence
- `/marketplace/recommendations` — Personalized recommendations with Claude reasoning
- Full data pipeline: Ringg.ai webhook → product_intelligence → marketplace_products
- Claude integration at all three layers
- Seed data script for two products

### P1 — Deferred to follow-up work
- `/brand` — Brand dashboard overview (campaign summary stats)
- `/marketplace` — Marketplace home with collections and featured products
- `/marketplace/compare` — Side-by-side product comparison
- `/marketplace/routine` — Routine builder
- `/marketplace/onboarding` — Consumer profile onboarding flow (replaced by inline profile input)
- `/marketplace/collections/[slug]` — Concern-based collections
- Brand settings page (`/brand/settings`)

### Outside scope
- Authentication or multi-tenant brand isolation
- Actual affiliate payment tracking
- Full test suite
- CI/CD beyond Vercel auto-deploy

---

## Dependencies / Assumptions

- Ringg.ai workspace API key, agent ID, and outbound phone number are configured before build starts
- The Ringg.ai beauty feedback assistant prompt is pre-configured in the dashboard (provided in Buildathon spec Document 2)
- Supabase project is created with a public schema before DB migration runs
- `NEXT_PUBLIC_APP_URL` must be a publicly accessible URL for Ringg.ai webhooks (use ngrok locally or deploy to Vercel first)
- Seed data uses pre-generated transcript JSON — no live calls required for seeding

---

## Outstanding Questions

- What Ringg.ai credentials are available? (RINGG_API_KEY, RINGG_AGENT_ID, RINGG_FROM_NUMBER_ID) — needed before the live pipeline demo can run.
- Is the app being deployed to Vercel during the build, or running locally with ngrok for webhook testing?
