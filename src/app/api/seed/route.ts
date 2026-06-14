import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createServerClient } from '@/lib/supabase';
import { recomputeMarketplaceProduct } from '@/lib/marketplace-aggregator';

function hashPhone(phone: string): string {
  return crypto.createHash('sha256').update(phone).digest('hex');
}

function makePhone(n: number): string {
  return hashPhone(`+9198765${n.toString().padStart(5, '0')}`);
}

// ── Minimalist Niacinamide Serum Records ─────────────────────────────────

const SERUM_PRODUCT = { product_name: '10% Niacinamide Serum', brand_name: 'Minimalist' };

const SERUM_TRANSCRIPTS = [
  [
    { role: 'bot', content: 'Hi, I am Ava calling from Minimalist. You recently purchased our 10% Niacinamide Serum. Do you have a few minutes to share your experience?' },
    { role: 'user', content: 'Yes sure, I have been using it for about 3 weeks now.' },
    { role: 'bot', content: 'Great! How has the texture felt on your skin?' },
    { role: 'user', content: 'It is really lightweight, absorbs quickly. No sticky feeling at all, I love it.' },
    { role: 'bot', content: 'Wonderful. Have you noticed any improvement in your skin concerns?' },
    { role: 'user', content: 'Yes, my pores look smaller and the oiliness has reduced significantly. I am very happy.' },
    { role: 'bot', content: 'On a scale of 1 to 10, how likely are you to recommend this to a friend?' },
    { role: 'user', content: 'Definitely a 9. I already told my roommate about it.' },
  ],
  [
    { role: 'bot', content: 'Hi, this is Ava from Minimalist. How has your experience been with the Niacinamide Serum?' },
    { role: 'user', content: 'Haan, bahut accha laga. Mera skin oily hai aur yeh serum ne bahut help kiya.' },
    { role: 'bot', content: 'That is great to hear! Would you repurchase this product?' },
    { role: 'user', content: 'Bilkul, main toh already second bottle order kar di hai.' },
    { role: 'bot', content: 'How would you rate the effectiveness for oil control from 1 to 5?' },
    { role: 'user', content: 'Main toh 5 dunga, seriously impressive results hain.' },
  ],
  [
    { role: 'bot', content: 'Hi, I am Ava from Minimalist! Quick question about your Niacinamide Serum experience.' },
    { role: 'user', content: 'Sure, go ahead.' },
    { role: 'bot', content: 'Have you noticed any tingling or irritation after applying?' },
    { role: 'user', content: 'A little bit of tingling in the first week but it went away. Now it feels fine.' },
    { role: 'bot', content: 'How is your skin type and what results have you seen?' },
    { role: 'user', content: 'I have combination skin. The T-zone oiliness is much better and my dark spots are slowly fading.' },
    { role: 'bot', content: 'Would you say the product met your expectations?' },
    { role: 'user', content: 'Yes, honestly better than what I expected for the price point. Good value.' },
  ],
];

const SERUM_ANALYSIS_HIGH_SAT = [
  { skin_type: 'oily', overall_sentiment: 'positive' as const, texture_score: 4.5, effectiveness_score: 4.8, fragrance_score: 4.0, value_score: 4.7, packaging_score: 4.2, repurchase_intent: 'definitely_yes' as const, recommendation_likelihood: 9, customer_segment: 'oily_skin_enthusiast', recommended_action: 'request_review', issues_reported: [], usage_mistakes: [], unanswered_questions: [], adverse_reaction_flag: false },
  { skin_type: 'oily', overall_sentiment: 'positive' as const, texture_score: 4.6, effectiveness_score: 4.9, fragrance_score: 4.1, value_score: 4.8, packaging_score: 4.3, repurchase_intent: 'definitely_yes' as const, recommendation_likelihood: 10, customer_segment: 'oily_skin_enthusiast', recommended_action: 'request_review', issues_reported: [], usage_mistakes: [], unanswered_questions: [], adverse_reaction_flag: false },
  { skin_type: 'combination', overall_sentiment: 'positive' as const, texture_score: 4.4, effectiveness_score: 4.6, fragrance_score: 4.2, value_score: 4.5, packaging_score: 4.0, repurchase_intent: 'definitely_yes' as const, recommendation_likelihood: 9, customer_segment: 'combination_skin_user', recommended_action: 'request_review', issues_reported: [], usage_mistakes: [], unanswered_questions: [], adverse_reaction_flag: false },
  { skin_type: 'oily', overall_sentiment: 'positive' as const, texture_score: 4.7, effectiveness_score: 4.7, fragrance_score: 4.0, value_score: 4.9, packaging_score: 4.4, repurchase_intent: 'probably_yes' as const, recommendation_likelihood: 8, customer_segment: 'oily_skin_enthusiast', recommended_action: 'repurchase_reminder', issues_reported: [], usage_mistakes: [], unanswered_questions: [], adverse_reaction_flag: false },
  { skin_type: 'combination', overall_sentiment: 'positive' as const, texture_score: 4.3, effectiveness_score: 4.5, fragrance_score: 4.3, value_score: 4.6, packaging_score: 4.2, repurchase_intent: 'definitely_yes' as const, recommendation_likelihood: 9, customer_segment: 'combination_skin_user', recommended_action: 'request_review', issues_reported: [], usage_mistakes: [], unanswered_questions: [], adverse_reaction_flag: false },
  { skin_type: 'oily', overall_sentiment: 'positive' as const, texture_score: 4.8, effectiveness_score: 4.8, fragrance_score: 4.1, value_score: 4.7, packaging_score: 4.5, repurchase_intent: 'definitely_yes' as const, recommendation_likelihood: 10, customer_segment: 'oily_skin_enthusiast', recommended_action: 'cross_sell', issues_reported: [], usage_mistakes: [], unanswered_questions: [], adverse_reaction_flag: false },
  { skin_type: 'oily', overall_sentiment: 'positive' as const, texture_score: 4.5, effectiveness_score: 4.6, fragrance_score: 4.0, value_score: 4.8, packaging_score: 4.1, repurchase_intent: 'probably_yes' as const, recommendation_likelihood: 8, customer_segment: 'oily_skin_enthusiast', recommended_action: 'repurchase_reminder', issues_reported: [], usage_mistakes: [], unanswered_questions: [], adverse_reaction_flag: false },
  { skin_type: 'combination', overall_sentiment: 'positive' as const, texture_score: 4.4, effectiveness_score: 4.7, fragrance_score: 4.2, value_score: 4.6, packaging_score: 4.3, repurchase_intent: 'definitely_yes' as const, recommendation_likelihood: 9, customer_segment: 'combination_skin_user', recommended_action: 'request_review', issues_reported: [], usage_mistakes: [], unanswered_questions: [], adverse_reaction_flag: false },
  { skin_type: 'oily', overall_sentiment: 'positive' as const, texture_score: 4.6, effectiveness_score: 4.9, fragrance_score: 4.0, value_score: 4.7, packaging_score: 4.2, repurchase_intent: 'definitely_yes' as const, recommendation_likelihood: 10, customer_segment: 'oily_skin_enthusiast', recommended_action: 'request_review', issues_reported: [], usage_mistakes: [], unanswered_questions: [], adverse_reaction_flag: false },
  { skin_type: 'combination', overall_sentiment: 'positive' as const, texture_score: 4.3, effectiveness_score: 4.5, fragrance_score: 4.4, value_score: 4.5, packaging_score: 4.0, repurchase_intent: 'probably_yes' as const, recommendation_likelihood: 8, customer_segment: 'combination_skin_user', recommended_action: 'repurchase_reminder', issues_reported: [], usage_mistakes: [], unanswered_questions: [], adverse_reaction_flag: false },
  { skin_type: 'oily', overall_sentiment: 'positive' as const, texture_score: 4.7, effectiveness_score: 4.8, fragrance_score: 4.1, value_score: 4.8, packaging_score: 4.4, repurchase_intent: 'definitely_yes' as const, recommendation_likelihood: 9, customer_segment: 'oily_skin_enthusiast', recommended_action: 'request_review', issues_reported: [], usage_mistakes: [], unanswered_questions: [], adverse_reaction_flag: false },
  { skin_type: 'oily', overall_sentiment: 'positive' as const, texture_score: 4.5, effectiveness_score: 4.7, fragrance_score: 4.2, value_score: 4.9, packaging_score: 4.3, repurchase_intent: 'definitely_yes' as const, recommendation_likelihood: 9, customer_segment: 'oily_skin_enthusiast', recommended_action: 'cross_sell', issues_reported: [], usage_mistakes: [], unanswered_questions: [], adverse_reaction_flag: false },
  { skin_type: 'combination', overall_sentiment: 'positive' as const, texture_score: 4.4, effectiveness_score: 4.6, fragrance_score: 4.0, value_score: 4.6, packaging_score: 4.1, repurchase_intent: 'probably_yes' as const, recommendation_likelihood: 8, customer_segment: 'combination_skin_user', recommended_action: 'repurchase_reminder', issues_reported: [], usage_mistakes: [], unanswered_questions: [], adverse_reaction_flag: false },
  { skin_type: 'oily', overall_sentiment: 'positive' as const, texture_score: 4.8, effectiveness_score: 4.9, fragrance_score: 4.1, value_score: 4.7, packaging_score: 4.5, repurchase_intent: 'definitely_yes' as const, recommendation_likelihood: 10, customer_segment: 'oily_skin_enthusiast', recommended_action: 'request_review', issues_reported: [], usage_mistakes: [], unanswered_questions: [], adverse_reaction_flag: false },
  { skin_type: 'combination', overall_sentiment: 'positive' as const, texture_score: 4.3, effectiveness_score: 4.5, fragrance_score: 4.3, value_score: 4.5, packaging_score: 4.2, repurchase_intent: 'definitely_yes' as const, recommendation_likelihood: 9, customer_segment: 'combination_skin_user', recommended_action: 'request_review', issues_reported: [], usage_mistakes: [], unanswered_questions: [], adverse_reaction_flag: false },
  { skin_type: 'oily', overall_sentiment: 'positive' as const, texture_score: 4.6, effectiveness_score: 4.8, fragrance_score: 4.0, value_score: 4.8, packaging_score: 4.4, repurchase_intent: 'definitely_yes' as const, recommendation_likelihood: 9, customer_segment: 'oily_skin_enthusiast', recommended_action: 'cross_sell', issues_reported: [], usage_mistakes: [], unanswered_questions: [], adverse_reaction_flag: false },
  { skin_type: 'combination', overall_sentiment: 'positive' as const, texture_score: 4.4, effectiveness_score: 4.7, fragrance_score: 4.2, value_score: 4.6, packaging_score: 4.3, repurchase_intent: 'probably_yes' as const, recommendation_likelihood: 8, customer_segment: 'combination_skin_user', recommended_action: 'repurchase_reminder', issues_reported: [], usage_mistakes: [], unanswered_questions: [], adverse_reaction_flag: false },
  { skin_type: 'oily', overall_sentiment: 'positive' as const, texture_score: 4.7, effectiveness_score: 4.9, fragrance_score: 4.1, value_score: 4.9, packaging_score: 4.5, repurchase_intent: 'definitely_yes' as const, recommendation_likelihood: 10, customer_segment: 'oily_skin_enthusiast', recommended_action: 'request_review', issues_reported: [], usage_mistakes: [], unanswered_questions: [], adverse_reaction_flag: false },
];

const SERUM_ANALYSIS_DRY = [
  { skin_type: 'dry', overall_sentiment: 'neutral' as const, texture_score: 3.2, effectiveness_score: 3.5, fragrance_score: 4.0, value_score: 3.8, packaging_score: 4.0, repurchase_intent: 'unsure' as const, recommendation_likelihood: 6, customer_segment: 'dry_skin_user', recommended_action: 'send_usage_guide', issues_reported: [{ issue: 'skin_feels_tight_after_use', severity: 'mild' as const }], usage_mistakes: ['not_using_moisturizer_after'], unanswered_questions: ['Should I use a heavier moisturizer after?'], adverse_reaction_flag: false },
  { skin_type: 'dry', overall_sentiment: 'neutral' as const, texture_score: 3.0, effectiveness_score: 3.4, fragrance_score: 3.9, value_score: 3.7, packaging_score: 4.1, repurchase_intent: 'probably_no' as const, recommendation_likelihood: 5, customer_segment: 'dry_skin_user', recommended_action: 'send_usage_guide', issues_reported: [{ issue: 'dryness_worsened', severity: 'moderate' as const }], usage_mistakes: ['not_using_moisturizer_after', 'applying_on_dry_skin'], unanswered_questions: ['Can I mix with moisturizer?'], adverse_reaction_flag: false },
  { skin_type: 'dry', overall_sentiment: 'neutral' as const, texture_score: 3.3, effectiveness_score: 3.6, fragrance_score: 4.1, value_score: 3.9, packaging_score: 4.0, repurchase_intent: 'unsure' as const, recommendation_likelihood: 5, customer_segment: 'dry_skin_user', recommended_action: 'send_usage_guide', issues_reported: [{ issue: 'flakiness_around_nose', severity: 'mild' as const }], usage_mistakes: ['not_using_moisturizer_after'], unanswered_questions: [], adverse_reaction_flag: false },
  { skin_type: 'dry', overall_sentiment: 'negative' as const, texture_score: 2.8, effectiveness_score: 2.9, fragrance_score: 3.8, value_score: 3.5, packaging_score: 4.0, repurchase_intent: 'definitely_no' as const, recommendation_likelihood: 3, customer_segment: 'dry_skin_user', recommended_action: 'churn_intervention', issues_reported: [{ issue: 'increased_dryness', severity: 'moderate' as const }, { issue: 'skin_feels_tight', severity: 'moderate' as const }], usage_mistakes: ['not_using_moisturizer_after', 'over_applying'], unanswered_questions: ['Is this product suitable for dry skin?'], adverse_reaction_flag: false },
  { skin_type: 'dry', overall_sentiment: 'neutral' as const, texture_score: 3.1, effectiveness_score: 3.4, fragrance_score: 4.0, value_score: 3.6, packaging_score: 4.2, repurchase_intent: 'unsure' as const, recommendation_likelihood: 5, customer_segment: 'dry_skin_user', recommended_action: 'send_usage_guide', issues_reported: [{ issue: 'skin_feels_tight', severity: 'mild' as const }], usage_mistakes: ['not_using_moisturizer_after'], unanswered_questions: [], adverse_reaction_flag: false },
  { skin_type: 'dry', overall_sentiment: 'neutral' as const, texture_score: 3.4, effectiveness_score: 3.7, fragrance_score: 4.0, value_score: 3.8, packaging_score: 4.1, repurchase_intent: 'probably_no' as const, recommendation_likelihood: 5, customer_segment: 'dry_skin_user', recommended_action: 'send_usage_guide', issues_reported: [{ issue: 'dryness_around_mouth', severity: 'mild' as const }], usage_mistakes: ['not_using_moisturizer_after'], unanswered_questions: ['How much moisturizer should I use after?'], adverse_reaction_flag: false },
  { skin_type: 'dry', overall_sentiment: 'neutral' as const, texture_score: 3.0, effectiveness_score: 3.3, fragrance_score: 3.9, value_score: 3.7, packaging_score: 4.0, repurchase_intent: 'unsure' as const, recommendation_likelihood: 5, customer_segment: 'dry_skin_user', recommended_action: 'send_usage_guide', issues_reported: [{ issue: 'skin_feels_tight_after_use', severity: 'mild' as const }], usage_mistakes: ['not_using_moisturizer_after'], unanswered_questions: [], adverse_reaction_flag: false },
  { skin_type: 'dry', overall_sentiment: 'neutral' as const, texture_score: 3.2, effectiveness_score: 3.5, fragrance_score: 4.1, value_score: 3.8, packaging_score: 4.0, repurchase_intent: 'unsure' as const, recommendation_likelihood: 6, customer_segment: 'dry_skin_user', recommended_action: 'send_usage_guide', issues_reported: [{ issue: 'skin_feels_tight', severity: 'mild' as const }], usage_mistakes: ['not_using_moisturizer_after'], unanswered_questions: ['Should I use this product twice daily?'], adverse_reaction_flag: false },
];

const SERUM_ANALYSIS_CONFUSED = [
  { skin_type: 'oily', overall_sentiment: 'neutral' as const, texture_score: 3.5, effectiveness_score: 3.2, fragrance_score: 4.0, value_score: 4.0, packaging_score: 4.0, repurchase_intent: 'unsure' as const, recommendation_likelihood: 5, customer_segment: 'confused_beginner', recommended_action: 'send_usage_guide', issues_reported: [], usage_mistakes: ['not_using_moisturizer_after', 'mixing_with_vitamin_c'], unanswered_questions: ['Can I use with retinol?', 'Morning or night?'], adverse_reaction_flag: false },
  { skin_type: 'combination', overall_sentiment: 'neutral' as const, texture_score: 3.8, effectiveness_score: 3.4, fragrance_score: 4.1, value_score: 4.1, packaging_score: 4.0, repurchase_intent: 'unsure' as const, recommendation_likelihood: 6, customer_segment: 'confused_beginner', recommended_action: 'send_usage_guide', issues_reported: [], usage_mistakes: ['using_too_much_product', 'not_using_moisturizer_after'], unanswered_questions: ['How many drops should I use?'], adverse_reaction_flag: false },
  { skin_type: 'oily', overall_sentiment: 'neutral' as const, texture_score: 3.6, effectiveness_score: 3.3, fragrance_score: 4.0, value_score: 4.2, packaging_score: 4.1, repurchase_intent: 'unsure' as const, recommendation_likelihood: 5, customer_segment: 'confused_beginner', recommended_action: 'send_usage_guide', issues_reported: [], usage_mistakes: ['mixing_with_vitamin_c'], unanswered_questions: ['When should I use this in my routine?'], adverse_reaction_flag: false },
  { skin_type: 'combination', overall_sentiment: 'neutral' as const, texture_score: 3.7, effectiveness_score: 3.5, fragrance_score: 3.9, value_score: 4.0, packaging_score: 4.2, repurchase_intent: 'probably_yes' as const, recommendation_likelihood: 6, customer_segment: 'confused_beginner', recommended_action: 'send_usage_guide', issues_reported: [], usage_mistakes: ['not_using_moisturizer_after'], unanswered_questions: ['Is it safe to use daily?'], adverse_reaction_flag: false },
  { skin_type: 'oily', overall_sentiment: 'neutral' as const, texture_score: 3.4, effectiveness_score: 3.1, fragrance_score: 4.0, value_score: 4.0, packaging_score: 4.0, repurchase_intent: 'unsure' as const, recommendation_likelihood: 5, customer_segment: 'confused_beginner', recommended_action: 'send_usage_guide', issues_reported: [], usage_mistakes: ['using_too_much_product', 'mixing_with_aha_bha'], unanswered_questions: ['Can I use with chemical exfoliants?'], adverse_reaction_flag: false },
  { skin_type: 'combination', overall_sentiment: 'neutral' as const, texture_score: 3.9, effectiveness_score: 3.6, fragrance_score: 4.2, value_score: 4.1, packaging_score: 4.1, repurchase_intent: 'probably_yes' as const, recommendation_likelihood: 6, customer_segment: 'confused_beginner', recommended_action: 'send_usage_guide', issues_reported: [], usage_mistakes: ['not_using_moisturizer_after'], unanswered_questions: [], adverse_reaction_flag: false },
  { skin_type: 'oily', overall_sentiment: 'neutral' as const, texture_score: 3.5, effectiveness_score: 3.3, fragrance_score: 4.0, value_score: 4.2, packaging_score: 4.0, repurchase_intent: 'unsure' as const, recommendation_likelihood: 5, customer_segment: 'confused_beginner', recommended_action: 'send_usage_guide', issues_reported: [], usage_mistakes: ['mixing_with_vitamin_c', 'not_using_spf_after'], unanswered_questions: ['Do I need SPF after?'], adverse_reaction_flag: false },
  { skin_type: 'combination', overall_sentiment: 'positive' as const, texture_score: 4.0, effectiveness_score: 3.8, fragrance_score: 4.1, value_score: 4.3, packaging_score: 4.2, repurchase_intent: 'probably_yes' as const, recommendation_likelihood: 7, customer_segment: 'confused_beginner', recommended_action: 'send_usage_guide', issues_reported: [], usage_mistakes: ['not_using_moisturizer_after'], unanswered_questions: ['How long until I see results?'], adverse_reaction_flag: false },
];

const SERUM_ANALYSIS_ADVERSE = [
  { skin_type: 'sensitive', overall_sentiment: 'negative' as const, texture_score: 2.0, effectiveness_score: 1.5, fragrance_score: 3.0, value_score: 2.0, packaging_score: 4.0, repurchase_intent: 'definitely_no' as const, recommendation_likelihood: 1, customer_segment: 'sensitive_skin_adverse', recommended_action: 'escalate_to_support', issues_reported: [{ issue: 'severe_tingling_and_burning', severity: 'severe' as const }, { issue: 'redness_and_inflammation', severity: 'severe' as const }], usage_mistakes: [], unanswered_questions: ['Is 10% too strong for sensitive skin?'], adverse_reaction_flag: true },
  { skin_type: 'sensitive', overall_sentiment: 'negative' as const, texture_score: 2.5, effectiveness_score: 1.8, fragrance_score: 3.5, value_score: 2.5, packaging_score: 4.0, repurchase_intent: 'definitely_no' as const, recommendation_likelihood: 1, customer_segment: 'sensitive_skin_adverse', recommended_action: 'escalate_to_support', issues_reported: [{ issue: 'burning_sensation', severity: 'severe' as const }, { issue: 'micro_irritation', severity: 'moderate' as const }], usage_mistakes: [], unanswered_questions: ['What should I do for the reaction?'], adverse_reaction_flag: true },
  { skin_type: 'sensitive', overall_sentiment: 'negative' as const, texture_score: 2.2, effectiveness_score: 1.6, fragrance_score: 3.2, value_score: 2.2, packaging_score: 4.0, repurchase_intent: 'definitely_no' as const, recommendation_likelihood: 2, customer_segment: 'sensitive_skin_adverse', recommended_action: 'escalate_to_support', issues_reported: [{ issue: 'tingling_stopped_using', severity: 'severe' as const }], usage_mistakes: [], unanswered_questions: ['Is this safe for reactive skin?'], adverse_reaction_flag: true },
  { skin_type: 'sensitive', overall_sentiment: 'negative' as const, texture_score: 2.3, effectiveness_score: 1.7, fragrance_score: 3.1, value_score: 2.1, packaging_score: 4.1, repurchase_intent: 'definitely_no' as const, recommendation_likelihood: 1, customer_segment: 'sensitive_skin_adverse', recommended_action: 'escalate_to_support', issues_reported: [{ issue: 'burning_sensation', severity: 'severe' as const }, { issue: 'skin_peeling', severity: 'moderate' as const }], usage_mistakes: [], unanswered_questions: ['Should I try 5% version?'], adverse_reaction_flag: true },
];

const SERUM_ANALYSIS_GIFT = [
  { skin_type: undefined, overall_sentiment: 'neutral' as const, texture_score: undefined, effectiveness_score: undefined, fragrance_score: undefined, value_score: undefined, packaging_score: 4.5, repurchase_intent: 'unsure' as const, recommendation_likelihood: 5, customer_segment: 'gift_buyer', recommended_action: 'no_action', issues_reported: [], usage_mistakes: [], unanswered_questions: ['What skin type is this good for?'], adverse_reaction_flag: false, non_usage_reason: 'bought_as_gift' },
  { skin_type: undefined, overall_sentiment: 'neutral' as const, texture_score: undefined, effectiveness_score: undefined, fragrance_score: undefined, value_score: undefined, packaging_score: 4.3, repurchase_intent: 'unsure' as const, recommendation_likelihood: 6, customer_segment: 'gift_buyer', recommended_action: 'no_action', issues_reported: [], usage_mistakes: [], unanswered_questions: [], adverse_reaction_flag: false, non_usage_reason: 'bought_as_gift' },
];

// ── Plum Face Wash Records ────────────────────────────────────────────────

const WASH_PRODUCT = { product_name: 'Green Tea Anti-Acne Face Wash', brand_name: 'Plum' };

const WASH_ANALYSIS_HIGH_SAT = [
  { skin_type: 'oily', overall_sentiment: 'positive' as const, texture_score: 4.5, effectiveness_score: 4.7, fragrance_score: 4.8, value_score: 4.6, packaging_score: 4.4, repurchase_intent: 'definitely_yes' as const, recommendation_likelihood: 9, customer_segment: 'acne_prone_user', recommended_action: 'request_review', issues_reported: [], usage_mistakes: [], unanswered_questions: [], adverse_reaction_flag: false },
  { skin_type: 'oily', overall_sentiment: 'positive' as const, texture_score: 4.6, effectiveness_score: 4.8, fragrance_score: 4.9, value_score: 4.7, packaging_score: 4.5, repurchase_intent: 'definitely_yes' as const, recommendation_likelihood: 10, customer_segment: 'acne_prone_user', recommended_action: 'cross_sell', issues_reported: [], usage_mistakes: [], unanswered_questions: [], adverse_reaction_flag: false },
  { skin_type: 'combination', overall_sentiment: 'positive' as const, texture_score: 4.3, effectiveness_score: 4.6, fragrance_score: 4.7, value_score: 4.5, packaging_score: 4.2, repurchase_intent: 'definitely_yes' as const, recommendation_likelihood: 9, customer_segment: 'acne_prone_user', recommended_action: 'request_review', issues_reported: [], usage_mistakes: [], unanswered_questions: [], adverse_reaction_flag: false },
  { skin_type: 'oily', overall_sentiment: 'positive' as const, texture_score: 4.7, effectiveness_score: 4.9, fragrance_score: 4.8, value_score: 4.8, packaging_score: 4.6, repurchase_intent: 'definitely_yes' as const, recommendation_likelihood: 10, customer_segment: 'acne_prone_user', recommended_action: 'request_review', issues_reported: [], usage_mistakes: [], unanswered_questions: [], adverse_reaction_flag: false },
  { skin_type: 'oily', overall_sentiment: 'positive' as const, texture_score: 4.4, effectiveness_score: 4.7, fragrance_score: 4.9, value_score: 4.6, packaging_score: 4.3, repurchase_intent: 'probably_yes' as const, recommendation_likelihood: 8, customer_segment: 'acne_prone_user', recommended_action: 'repurchase_reminder', issues_reported: [], usage_mistakes: [], unanswered_questions: [], adverse_reaction_flag: false },
  { skin_type: 'combination', overall_sentiment: 'positive' as const, texture_score: 4.5, effectiveness_score: 4.6, fragrance_score: 4.7, value_score: 4.7, packaging_score: 4.4, repurchase_intent: 'definitely_yes' as const, recommendation_likelihood: 9, customer_segment: 'acne_prone_user', recommended_action: 'request_review', issues_reported: [], usage_mistakes: [], unanswered_questions: [], adverse_reaction_flag: false },
  { skin_type: 'oily', overall_sentiment: 'positive' as const, texture_score: 4.6, effectiveness_score: 4.8, fragrance_score: 4.8, value_score: 4.9, packaging_score: 4.5, repurchase_intent: 'definitely_yes' as const, recommendation_likelihood: 9, customer_segment: 'acne_prone_user', recommended_action: 'cross_sell', issues_reported: [], usage_mistakes: [], unanswered_questions: [], adverse_reaction_flag: false },
  { skin_type: 'oily', overall_sentiment: 'positive' as const, texture_score: 4.4, effectiveness_score: 4.7, fragrance_score: 4.7, value_score: 4.6, packaging_score: 4.3, repurchase_intent: 'probably_yes' as const, recommendation_likelihood: 8, customer_segment: 'acne_prone_user', recommended_action: 'repurchase_reminder', issues_reported: [], usage_mistakes: [], unanswered_questions: [], adverse_reaction_flag: false },
  { skin_type: 'combination', overall_sentiment: 'positive' as const, texture_score: 4.3, effectiveness_score: 4.5, fragrance_score: 4.8, value_score: 4.5, packaging_score: 4.2, repurchase_intent: 'definitely_yes' as const, recommendation_likelihood: 9, customer_segment: 'acne_prone_user', recommended_action: 'request_review', issues_reported: [], usage_mistakes: [], unanswered_questions: [], adverse_reaction_flag: false },
  { skin_type: 'oily', overall_sentiment: 'positive' as const, texture_score: 4.7, effectiveness_score: 4.9, fragrance_score: 4.9, value_score: 4.8, packaging_score: 4.6, repurchase_intent: 'definitely_yes' as const, recommendation_likelihood: 10, customer_segment: 'acne_prone_user', recommended_action: 'request_review', issues_reported: [], usage_mistakes: [], unanswered_questions: [], adverse_reaction_flag: false },
  { skin_type: 'oily', overall_sentiment: 'positive' as const, texture_score: 4.5, effectiveness_score: 4.7, fragrance_score: 4.8, value_score: 4.7, packaging_score: 4.4, repurchase_intent: 'definitely_yes' as const, recommendation_likelihood: 9, customer_segment: 'acne_prone_user', recommended_action: 'request_review', issues_reported: [], usage_mistakes: [], unanswered_questions: [], adverse_reaction_flag: false },
  { skin_type: 'combination', overall_sentiment: 'positive' as const, texture_score: 4.4, effectiveness_score: 4.6, fragrance_score: 4.7, value_score: 4.6, packaging_score: 4.3, repurchase_intent: 'probably_yes' as const, recommendation_likelihood: 8, customer_segment: 'acne_prone_user', recommended_action: 'repurchase_reminder', issues_reported: [], usage_mistakes: [], unanswered_questions: [], adverse_reaction_flag: false },
  { skin_type: 'oily', overall_sentiment: 'positive' as const, texture_score: 4.6, effectiveness_score: 4.8, fragrance_score: 4.9, value_score: 4.8, packaging_score: 4.5, repurchase_intent: 'definitely_yes' as const, recommendation_likelihood: 9, customer_segment: 'acne_prone_user', recommended_action: 'cross_sell', issues_reported: [], usage_mistakes: [], unanswered_questions: [], adverse_reaction_flag: false },
  { skin_type: 'oily', overall_sentiment: 'positive' as const, texture_score: 4.4, effectiveness_score: 4.7, fragrance_score: 4.8, value_score: 4.7, packaging_score: 4.4, repurchase_intent: 'definitely_yes' as const, recommendation_likelihood: 9, customer_segment: 'acne_prone_user', recommended_action: 'request_review', issues_reported: [], usage_mistakes: [], unanswered_questions: [], adverse_reaction_flag: false },
  { skin_type: 'combination', overall_sentiment: 'positive' as const, texture_score: 4.5, effectiveness_score: 4.6, fragrance_score: 4.7, value_score: 4.6, packaging_score: 4.3, repurchase_intent: 'definitely_yes' as const, recommendation_likelihood: 9, customer_segment: 'acne_prone_user', recommended_action: 'request_review', issues_reported: [], usage_mistakes: [], unanswered_questions: [], adverse_reaction_flag: false },
  { skin_type: 'oily', overall_sentiment: 'positive' as const, texture_score: 4.7, effectiveness_score: 4.9, fragrance_score: 4.8, value_score: 4.9, packaging_score: 4.6, repurchase_intent: 'definitely_yes' as const, recommendation_likelihood: 10, customer_segment: 'acne_prone_user', recommended_action: 'request_review', issues_reported: [], usage_mistakes: [], unanswered_questions: [], adverse_reaction_flag: false },
  { skin_type: 'oily', overall_sentiment: 'positive' as const, texture_score: 4.5, effectiveness_score: 4.7, fragrance_score: 4.8, value_score: 4.7, packaging_score: 4.5, repurchase_intent: 'probably_yes' as const, recommendation_likelihood: 8, customer_segment: 'acne_prone_user', recommended_action: 'repurchase_reminder', issues_reported: [], usage_mistakes: [], unanswered_questions: [], adverse_reaction_flag: false },
  { skin_type: 'combination', overall_sentiment: 'positive' as const, texture_score: 4.3, effectiveness_score: 4.5, fragrance_score: 4.7, value_score: 4.5, packaging_score: 4.2, repurchase_intent: 'definitely_yes' as const, recommendation_likelihood: 9, customer_segment: 'acne_prone_user', recommended_action: 'request_review', issues_reported: [], usage_mistakes: [], unanswered_questions: [], adverse_reaction_flag: false },
  { skin_type: 'oily', overall_sentiment: 'positive' as const, texture_score: 4.6, effectiveness_score: 4.8, fragrance_score: 4.9, value_score: 4.8, packaging_score: 4.5, repurchase_intent: 'definitely_yes' as const, recommendation_likelihood: 9, customer_segment: 'acne_prone_user', recommended_action: 'cross_sell', issues_reported: [], usage_mistakes: [], unanswered_questions: [], adverse_reaction_flag: false },
  { skin_type: 'oily', overall_sentiment: 'positive' as const, texture_score: 4.4, effectiveness_score: 4.7, fragrance_score: 4.8, value_score: 4.6, packaging_score: 4.4, repurchase_intent: 'definitely_yes' as const, recommendation_likelihood: 9, customer_segment: 'acne_prone_user', recommended_action: 'request_review', issues_reported: [], usage_mistakes: [], unanswered_questions: [], adverse_reaction_flag: false },
];

const WASH_ANALYSIS_SENSITIVE = [
  { skin_type: 'sensitive', overall_sentiment: 'neutral' as const, texture_score: 3.2, effectiveness_score: 3.5, fragrance_score: 2.5, value_score: 3.5, packaging_score: 4.0, repurchase_intent: 'probably_no' as const, recommendation_likelihood: 4, customer_segment: 'sensitive_skin_user', recommended_action: 'send_usage_guide', issues_reported: [{ issue: 'fragrance_too_strong', severity: 'moderate' as const }, { issue: 'skin_feels_tight', severity: 'mild' as const }], usage_mistakes: ['washing_twice_daily'], unanswered_questions: ['Is there a fragrance-free version?'], adverse_reaction_flag: false },
  { skin_type: 'sensitive', overall_sentiment: 'neutral' as const, texture_score: 3.0, effectiveness_score: 3.3, fragrance_score: 2.3, value_score: 3.3, packaging_score: 4.1, repurchase_intent: 'probably_no' as const, recommendation_likelihood: 4, customer_segment: 'sensitive_skin_user', recommended_action: 'send_usage_guide', issues_reported: [{ issue: 'fragrance_overpowering', severity: 'moderate' as const }, { issue: 'dryness_after_wash', severity: 'moderate' as const }], usage_mistakes: ['washing_twice_daily', 'using_hot_water'], unanswered_questions: ['Why does it dry out my skin?'], adverse_reaction_flag: false },
  { skin_type: 'sensitive', overall_sentiment: 'neutral' as const, texture_score: 3.3, effectiveness_score: 3.4, fragrance_score: 2.8, value_score: 3.6, packaging_score: 4.0, repurchase_intent: 'unsure' as const, recommendation_likelihood: 5, customer_segment: 'sensitive_skin_user', recommended_action: 'send_usage_guide', issues_reported: [{ issue: 'fragrance_irritation', severity: 'mild' as const }], usage_mistakes: ['washing_twice_daily'], unanswered_questions: [], adverse_reaction_flag: false },
  { skin_type: 'sensitive', overall_sentiment: 'neutral' as const, texture_score: 3.1, effectiveness_score: 3.2, fragrance_score: 2.4, value_score: 3.4, packaging_score: 4.0, repurchase_intent: 'probably_no' as const, recommendation_likelihood: 4, customer_segment: 'sensitive_skin_user', recommended_action: 'send_usage_guide', issues_reported: [{ issue: 'fragrance_too_strong', severity: 'moderate' as const }, { issue: 'skin_feels_tight_after', severity: 'mild' as const }], usage_mistakes: ['washing_twice_daily', 'using_hot_water'], unanswered_questions: ['Should I use a toner after?'], adverse_reaction_flag: false },
  { skin_type: 'sensitive', overall_sentiment: 'neutral' as const, texture_score: 3.4, effectiveness_score: 3.6, fragrance_score: 2.6, value_score: 3.7, packaging_score: 4.2, repurchase_intent: 'unsure' as const, recommendation_likelihood: 5, customer_segment: 'sensitive_skin_user', recommended_action: 'send_usage_guide', issues_reported: [{ issue: 'fragrance_too_strong', severity: 'moderate' as const }], usage_mistakes: ['washing_twice_daily'], unanswered_questions: ['How often should I wash?'], adverse_reaction_flag: false },
  { skin_type: 'sensitive', overall_sentiment: 'negative' as const, texture_score: 2.8, effectiveness_score: 2.9, fragrance_score: 2.0, value_score: 3.0, packaging_score: 4.0, repurchase_intent: 'definitely_no' as const, recommendation_likelihood: 2, customer_segment: 'sensitive_skin_adverse', recommended_action: 'churn_intervention', issues_reported: [{ issue: 'fragrance_caused_breakout', severity: 'severe' as const }, { issue: 'redness', severity: 'moderate' as const }], usage_mistakes: [], unanswered_questions: ['Can I get a refund?'], adverse_reaction_flag: true },
  { skin_type: 'sensitive', overall_sentiment: 'neutral' as const, texture_score: 3.2, effectiveness_score: 3.4, fragrance_score: 2.7, value_score: 3.5, packaging_score: 4.1, repurchase_intent: 'probably_no' as const, recommendation_likelihood: 4, customer_segment: 'sensitive_skin_user', recommended_action: 'send_usage_guide', issues_reported: [{ issue: 'fragrance_too_strong', severity: 'moderate' as const }, { issue: 'dryness', severity: 'mild' as const }], usage_mistakes: ['washing_twice_daily'], unanswered_questions: [], adverse_reaction_flag: false },
  { skin_type: 'sensitive', overall_sentiment: 'neutral' as const, texture_score: 3.0, effectiveness_score: 3.3, fragrance_score: 2.5, value_score: 3.4, packaging_score: 4.0, repurchase_intent: 'unsure' as const, recommendation_likelihood: 5, customer_segment: 'sensitive_skin_user', recommended_action: 'send_usage_guide', issues_reported: [{ issue: 'fragrance_irritation', severity: 'mild' as const }, { issue: 'skin_tight_feeling', severity: 'mild' as const }], usage_mistakes: ['washing_twice_daily'], unanswered_questions: ['Is this sulfate free?'], adverse_reaction_flag: false },
  { skin_type: 'sensitive', overall_sentiment: 'neutral' as const, texture_score: 3.3, effectiveness_score: 3.5, fragrance_score: 2.6, value_score: 3.6, packaging_score: 4.1, repurchase_intent: 'probably_no' as const, recommendation_likelihood: 4, customer_segment: 'sensitive_skin_user', recommended_action: 'send_usage_guide', issues_reported: [{ issue: 'fragrance_too_strong', severity: 'moderate' as const }], usage_mistakes: ['washing_twice_daily', 'using_hot_water'], unanswered_questions: [], adverse_reaction_flag: false },
  { skin_type: 'sensitive', overall_sentiment: 'neutral' as const, texture_score: 3.1, effectiveness_score: 3.4, fragrance_score: 2.4, value_score: 3.5, packaging_score: 4.0, repurchase_intent: 'probably_no' as const, recommendation_likelihood: 4, customer_segment: 'sensitive_skin_user', recommended_action: 'send_usage_guide', issues_reported: [{ issue: 'fragrance_irritation', severity: 'mild' as const }, { issue: 'skin_feels_dry', severity: 'mild' as const }], usage_mistakes: ['washing_twice_daily'], unanswered_questions: ['Should I moisturize right after?'], adverse_reaction_flag: false },
];

const WASH_ANALYSIS_HARD_WATER = [
  { skin_type: 'oily', overall_sentiment: 'neutral' as const, texture_score: 3.5, effectiveness_score: 3.0, fragrance_score: 4.5, value_score: 3.8, packaging_score: 4.2, repurchase_intent: 'unsure' as const, recommendation_likelihood: 5, customer_segment: 'hard_water_area', recommended_action: 'send_usage_guide', issues_reported: [{ issue: 'not_lathering_well', severity: 'mild' as const }, { issue: 'residue_on_face', severity: 'mild' as const }], usage_mistakes: ['hard_water_not_accounted_for'], unanswered_questions: ['Does hard water affect this?'], adverse_reaction_flag: false },
  { skin_type: 'combination', overall_sentiment: 'neutral' as const, texture_score: 3.3, effectiveness_score: 2.8, fragrance_score: 4.4, value_score: 3.6, packaging_score: 4.0, repurchase_intent: 'probably_no' as const, recommendation_likelihood: 4, customer_segment: 'hard_water_area', recommended_action: 'send_usage_guide', issues_reported: [{ issue: 'poor_lather', severity: 'mild' as const }, { issue: 'waxy_residue', severity: 'moderate' as const }], usage_mistakes: ['hard_water_not_accounted_for'], unanswered_questions: ['Why is there a film on my face?'], adverse_reaction_flag: false },
  { skin_type: 'oily', overall_sentiment: 'neutral' as const, texture_score: 3.4, effectiveness_score: 2.9, fragrance_score: 4.5, value_score: 3.7, packaging_score: 4.1, repurchase_intent: 'unsure' as const, recommendation_likelihood: 5, customer_segment: 'hard_water_area', recommended_action: 'send_usage_guide', issues_reported: [{ issue: 'not_lathering', severity: 'mild' as const }], usage_mistakes: ['hard_water_not_accounted_for', 'not_rinsing_properly'], unanswered_questions: ['Should I use micellar water first?'], adverse_reaction_flag: false },
  { skin_type: 'combination', overall_sentiment: 'neutral' as const, texture_score: 3.2, effectiveness_score: 2.7, fragrance_score: 4.3, value_score: 3.5, packaging_score: 4.0, repurchase_intent: 'probably_no' as const, recommendation_likelihood: 4, customer_segment: 'hard_water_area', recommended_action: 'send_usage_guide', issues_reported: [{ issue: 'poor_lather', severity: 'mild' as const }, { issue: 'skin_not_feeling_clean', severity: 'moderate' as const }], usage_mistakes: ['hard_water_not_accounted_for'], unanswered_questions: ['How to fix hard water issue?'], adverse_reaction_flag: false },
  { skin_type: 'oily', overall_sentiment: 'neutral' as const, texture_score: 3.6, effectiveness_score: 3.1, fragrance_score: 4.6, value_score: 3.9, packaging_score: 4.2, repurchase_intent: 'unsure' as const, recommendation_likelihood: 5, customer_segment: 'hard_water_area', recommended_action: 'send_usage_guide', issues_reported: [{ issue: 'not_lathering_well', severity: 'mild' as const }], usage_mistakes: ['hard_water_not_accounted_for'], unanswered_questions: ['Is there a water softener tip?'], adverse_reaction_flag: false },
  { skin_type: 'oily', overall_sentiment: 'negative' as const, texture_score: 3.0, effectiveness_score: 2.5, fragrance_score: 4.3, value_score: 3.4, packaging_score: 4.0, repurchase_intent: 'definitely_no' as const, recommendation_likelihood: 3, customer_segment: 'hard_water_area', recommended_action: 'churn_intervention', issues_reported: [{ issue: 'product_ineffective_in_area', severity: 'moderate' as const }, { issue: 'poor_rinse_off', severity: 'moderate' as const }], usage_mistakes: ['hard_water_not_accounted_for'], unanswered_questions: ['Can I get my money back?'], adverse_reaction_flag: false },
];

const WASH_ANALYSIS_OVER_WASHING = [
  { skin_type: 'oily', overall_sentiment: 'neutral' as const, texture_score: 3.8, effectiveness_score: 3.4, fragrance_score: 4.5, value_score: 4.0, packaging_score: 4.2, repurchase_intent: 'unsure' as const, recommendation_likelihood: 5, customer_segment: 'over_cleanser', recommended_action: 'send_usage_guide', issues_reported: [{ issue: 'over_drying', severity: 'moderate' as const }], usage_mistakes: ['washing_three_times_daily', 'washing_with_hot_water'], unanswered_questions: ['Am I washing too much?'], adverse_reaction_flag: false },
  { skin_type: 'oily', overall_sentiment: 'neutral' as const, texture_score: 3.7, effectiveness_score: 3.3, fragrance_score: 4.4, value_score: 3.9, packaging_score: 4.1, repurchase_intent: 'probably_no' as const, recommendation_likelihood: 4, customer_segment: 'over_cleanser', recommended_action: 'send_usage_guide', issues_reported: [{ issue: 'skin_over_stripped', severity: 'moderate' as const }, { issue: 'rebound_oiliness', severity: 'moderate' as const }], usage_mistakes: ['washing_three_times_daily'], unanswered_questions: ['Why is my skin producing more oil now?'], adverse_reaction_flag: false },
  { skin_type: 'combination', overall_sentiment: 'neutral' as const, texture_score: 3.9, effectiveness_score: 3.5, fragrance_score: 4.5, value_score: 4.1, packaging_score: 4.3, repurchase_intent: 'unsure' as const, recommendation_likelihood: 5, customer_segment: 'over_cleanser', recommended_action: 'send_usage_guide', issues_reported: [{ issue: 'tightness_after_washing', severity: 'mild' as const }], usage_mistakes: ['washing_three_times_daily', 'not_moisturizing_after'], unanswered_questions: ['How many times should I wash?'], adverse_reaction_flag: false },
  { skin_type: 'oily', overall_sentiment: 'neutral' as const, texture_score: 3.6, effectiveness_score: 3.2, fragrance_score: 4.4, value_score: 3.8, packaging_score: 4.0, repurchase_intent: 'unsure' as const, recommendation_likelihood: 5, customer_segment: 'over_cleanser', recommended_action: 'send_usage_guide', issues_reported: [{ issue: 'over_drying', severity: 'moderate' as const }], usage_mistakes: ['washing_three_times_daily'], unanswered_questions: ['Should I use twice daily only?'], adverse_reaction_flag: false },
];

// ── Main Seeder ───────────────────────────────────────────────────────────

const SERUM_NAMES = [
  'Priya Sharma', 'Anjali Singh', 'Sneha Patel', 'Meera Nair', 'Kavya Reddy',
  'Divya Krishnan', 'Pooja Gupta', 'Riya Verma', 'Aisha Khan', 'Shreya Joshi',
  'Tanvi Mehta', 'Nidhi Agarwal', 'Sakshi Bhatia', 'Pallavi Rao', 'Ananya Mishra',
  'Rohini Tiwari', 'Swati Chaudhary', 'Geeta Iyer', 'Komal Thakur', 'Madhuri Desai',
  'Lakshmi Pillai', 'Sunita Pandey', 'Rekha Saxena', 'Vandana Sinha', 'Puja Chatterjee',
  'Sonali Kapoor', 'Deepa Malhotra', 'Rashmi Bhatt', 'Nisha Sharma', 'Preeti Singh',
  'Asha Patel', 'Kiran Nair', 'Shalini Reddy', 'Usha Krishnan', 'Mamta Gupta',
  'Savita Verma', 'Leela Khan', 'Kamala Joshi', 'Radha Mehta', 'Saroj Agarwal',
];

const WASH_NAMES = [
  'Rohan Sharma', 'Aditya Singh', 'Vikram Patel', 'Arjun Nair', 'Karthik Reddy',
  'Siddharth Krishnan', 'Rahul Gupta', 'Manish Verma', 'Akash Khan', 'Varun Joshi',
  'Nikhil Mehta', 'Suresh Agarwal', 'Rajesh Bhatia', 'Manoj Rao', 'Vivek Mishra',
  'Deepak Tiwari', 'Sandeep Chaudhary', 'Harish Iyer', 'Prakash Thakur', 'Yogesh Desai',
  'Ravi Pillai', 'Ashok Pandey', 'Ramesh Saxena', 'Sunil Sinha', 'Pankaj Chatterjee',
  'Naveen Kapoor', 'Girish Malhotra', 'Tarun Bhatt', 'Vinay Sharma', 'Amit Singh',
  'Rajan Patel', 'Srikanth Nair', 'Venkat Reddy', 'Murali Krishnan', 'Rajendra Gupta',
  'Mohan Verma', 'Arun Khan', 'Sanjay Joshi', 'Dinesh Mehta', 'Balaji Agarwal',
];

export const maxDuration = 60;

export async function POST() {
  try {
    const db = createServerClient();
    return await runSeed(db);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[seed] Fatal error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

async function runSeed(db: ReturnType<typeof createServerClient>) {

  // ── 1. Delete existing seed data ──────────────────────────────────────
  const products = [SERUM_PRODUCT, WASH_PRODUCT];

  for (const p of products) {
    // Find campaign IDs for these products
    const { data: camps } = await db
      .from('campaigns')
      .select('id')
      .eq('product_name', p.product_name)
      .eq('brand_name', p.brand_name);

    if (camps && camps.length > 0) {
      const ids = camps.map((c: { id: string }) => c.id);
      await db.from('product_intelligence').delete().in('campaign_id', ids);
      await db.from('call_records').delete().in('campaign_id', ids);
      await db.from('campaigns').delete().in('id', ids);
    }

    await db.from('marketplace_products')
      .delete()
      .eq('product_name', p.product_name)
      .eq('brand_name', p.brand_name);
  }

  // ── 2. Create seed campaigns ──────────────────────────────────────────
  const { data: serumCampaign, error: e1 } = await db.from('campaigns').insert({
    brand_name: SERUM_PRODUCT.brand_name,
    campaign_name: 'Niacinamide Serum Feedback — June 2026',
    product_name: SERUM_PRODUCT.product_name,
    category: 'skincare_serum',
    status: 'completed',
    total_contacts: 40,
    completed_calls: 40,
  }).select().single();

  if (e1) throw new Error(`Campaign 1 insert failed: ${e1.message}`);

  const { data: washCampaign, error: e2 } = await db.from('campaigns').insert({
    brand_name: WASH_PRODUCT.brand_name,
    campaign_name: 'Green Tea Face Wash Feedback — June 2026',
    product_name: WASH_PRODUCT.product_name,
    category: 'skincare_cleanser',
    status: 'completed',
    total_contacts: 40,
    completed_calls: 40,
  }).select().single();

  if (e2) throw new Error(`Campaign 2 insert failed: ${e2.message}`);

  // ── 3. Insert call records and product intelligence ───────────────────
  const serumRecords = [
    ...SERUM_ANALYSIS_HIGH_SAT,   // 18 records
    ...SERUM_ANALYSIS_DRY,        // 8 records
    ...SERUM_ANALYSIS_CONFUSED,   // 8 records
    ...SERUM_ANALYSIS_ADVERSE,    // 4 records
    ...SERUM_ANALYSIS_GIFT,       // 2 records
  ]; // = 40 records

  const washRecords = [
    ...WASH_ANALYSIS_HIGH_SAT,    // 20 records
    ...WASH_ANALYSIS_SENSITIVE,   // 10 records
    ...WASH_ANALYSIS_HARD_WATER,  // 6 records
    ...WASH_ANALYSIS_OVER_WASHING, // 4 records
  ]; // = 40 records

  let callRecordsInserted = 0;
  let piInserted = 0;

  // ── Serum: batch insert all call records at once (1 DB call instead of 40) ─
  const serumCallRows = serumRecords.map((analysis, i) => ({
    campaign_id: serumCampaign.id,
    ringg_call_id: `seed_serum_${i + 1}`,
    callee_name: SERUM_NAMES[i],
    phone_hash: makePhone(i + 1),
    status: 'completed',
    call_duration: 120 + Math.floor((i * 47) % 160),
    recording_url: null,
    transcript_json: SERUM_TRANSCRIPTS[i % SERUM_TRANSCRIPTS.length],
    custom_analysis: analysis,
  }));

  const { data: insertedSerumCalls, error: serumCallErr } = await db
    .from('call_records')
    .insert(serumCallRows)
    .select('id');

  if (serumCallErr) throw new Error(`Serum call_records batch insert failed: ${serumCallErr.message}`);
  callRecordsInserted += insertedSerumCalls?.length ?? 0;

  const serumPIRows = (insertedSerumCalls ?? []).map((call, i) => {
    const analysis = serumRecords[i];
    return {
      campaign_id: serumCampaign.id,
      call_record_id: call.id,
      product_name: SERUM_PRODUCT.product_name,
      brand_name: SERUM_PRODUCT.brand_name,
      skin_type: analysis.skin_type,
      overall_sentiment: analysis.overall_sentiment,
      texture_score: analysis.texture_score,
      effectiveness_score: analysis.effectiveness_score,
      fragrance_score: analysis.fragrance_score,
      value_score: analysis.value_score,
      packaging_score: analysis.packaging_score,
      repurchase_intent: analysis.repurchase_intent,
      recommendation_likelihood: analysis.recommendation_likelihood,
      customer_segment: analysis.customer_segment,
      recommended_action: analysis.recommended_action,
      issues_reported: analysis.issues_reported,
      usage_mistakes: analysis.usage_mistakes,
      unanswered_questions_json: analysis.unanswered_questions,
      adverse_reaction_flag: analysis.adverse_reaction_flag,
      non_usage_reason: (analysis as { non_usage_reason?: string }).non_usage_reason ?? null,
      enriched_context: null,
    };
  });

  const { error: serumPIErr } = await db.from('product_intelligence').insert(serumPIRows);
  if (!serumPIErr) piInserted += serumPIRows.length;

  // ── Wash: batch insert all call records at once (1 DB call instead of 40) ──
  const washTranscript = (i: number) => [
    { role: 'bot', content: 'Hi, I am Ava from Plum. How has your experience been with the Green Tea Anti-Acne Face Wash?' },
    { role: 'user', content: i < 20 ? 'Really great! My acne has reduced significantly and the fragrance is amazing.' : 'It is okay, I have some concerns about it.' },
    { role: 'bot', content: 'Can you tell me more about the lather and how your skin feels after washing?' },
    { role: 'user', content: i < 20 ? 'Great lather and my skin feels really clean and fresh. Not drying at all.' : 'The fragrance is a bit too strong and my skin feels a little tight.' },
    { role: 'bot', content: 'Would you repurchase this product?' },
    { role: 'user', content: i < 20 ? 'Absolutely yes, I have already ordered my second bottle!' : 'I am not sure yet, I want to see how it goes.' },
  ];

  const washCallRows = washRecords.map((analysis, i) => ({
    campaign_id: washCampaign.id,
    ringg_call_id: `seed_wash_${i + 1}`,
    callee_name: WASH_NAMES[i],
    phone_hash: makePhone(i + 101),
    status: 'completed',
    call_duration: 130 + Math.floor((i * 53) % 150),
    recording_url: null,
    transcript_json: washTranscript(i),
    custom_analysis: analysis,
  }));

  const { data: insertedWashCalls, error: washCallErr } = await db
    .from('call_records')
    .insert(washCallRows)
    .select('id');

  if (washCallErr) throw new Error(`Wash call_records batch insert failed: ${washCallErr.message}`);
  callRecordsInserted += insertedWashCalls?.length ?? 0;

  const washPIRows = (insertedWashCalls ?? []).map((call, i) => {
    const analysis = washRecords[i];
    return {
      campaign_id: washCampaign.id,
      call_record_id: call.id,
      product_name: WASH_PRODUCT.product_name,
      brand_name: WASH_PRODUCT.brand_name,
      skin_type: analysis.skin_type,
      overall_sentiment: analysis.overall_sentiment,
      texture_score: analysis.texture_score,
      effectiveness_score: analysis.effectiveness_score,
      fragrance_score: analysis.fragrance_score,
      value_score: analysis.value_score,
      packaging_score: analysis.packaging_score,
      repurchase_intent: analysis.repurchase_intent,
      recommendation_likelihood: analysis.recommendation_likelihood,
      customer_segment: analysis.customer_segment,
      recommended_action: analysis.recommended_action,
      issues_reported: analysis.issues_reported,
      usage_mistakes: analysis.usage_mistakes,
      unanswered_questions_json: analysis.unanswered_questions,
      adverse_reaction_flag: analysis.adverse_reaction_flag,
      non_usage_reason: null,
      enriched_context: null,
    };
  });

  const { error: washPIErr } = await db.from('product_intelligence').insert(washPIRows);
  if (!washPIErr) piInserted += washPIRows.length;

  // ── 4. Recompute marketplace aggregates (fire-and-forget to avoid timeout) ─
  recomputeMarketplaceProduct(SERUM_PRODUCT.product_name, SERUM_PRODUCT.brand_name).catch((e) =>
    console.error('[seed] serum recompute failed:', e)
  );
  recomputeMarketplaceProduct(WASH_PRODUCT.product_name, WASH_PRODUCT.brand_name).catch((e) =>
    console.error('[seed] wash recompute failed:', e)
  );

  // ── 5. Insert demo marketplace products for remaining categories ────────
  const demoProducts = [
    {
      product_name: 'Ceramide & Niacinamide Moisturizer',
      brand_name: 'Foxtale',
      category: 'skincare_moisturizer',
      total_verified_conversations: 48,
      voice_trust_score: 84,
      avg_texture: 4.6, avg_effectiveness: 4.7, avg_fragrance: 3.9, avg_value: 4.5, avg_packaging: 4.4,
      sentiment_distribution: { positive: 38, neutral: 7, negative: 3 },
      repurchase_distribution: { definitely_yes: 28, probably_yes: 14, unsure: 4, probably_no: 2, definitely_no: 0 },
      works_best_for: [
        { profile: 'dry_skin', satisfaction: 4.8, note: '94% noticed softer skin within 3 days' },
        { profile: 'sensitive_skin', satisfaction: 4.5, note: 'Ceramides calmed reactivity in 87% of users' },
      ],
      not_ideal_for: [{ profile: 'acne-prone oily skin', reason: 'May feel heavy during summer months' }],
      top_insights: [
        '89% felt immediate hydration boost on first use',
        'Ceramide barrier noticeably strengthened after 2 weeks',
        'Fragrance-free formula preferred by sensitive skin users',
      ],
      common_questions: [
        { question: 'Can I use it under SPF?', answer: '92% of users layer it under sunscreen with no pilling.' },
        { question: 'Does it work for combination skin?', answer: '78% combination-skin users reported balanced hydration.' },
      ],
      education_gaps: [{ mistake: 'Applying on damp skin for better absorption', percentage: 34, tip: 'Pat skin dry lightly, then apply within 60 seconds for best penetration.' }],
      issue_summary: [{ issue: 'Slight white cast on darker skin tones', percentage: 8, severity: 'mild' as const, is_dealbreaker: false }],
    },
    {
      product_name: '2% Salicylic Acid Toner',
      brand_name: 'Minimalist',
      category: 'skincare_toner',
      total_verified_conversations: 52,
      voice_trust_score: 79,
      avg_texture: 4.4, avg_effectiveness: 4.6, avg_fragrance: 4.2, avg_value: 4.8, avg_packaging: 4.1,
      sentiment_distribution: { positive: 40, neutral: 8, negative: 4 },
      repurchase_distribution: { definitely_yes: 30, probably_yes: 15, unsure: 5, probably_no: 2, definitely_no: 0 },
      works_best_for: [
        { profile: 'oily_skin', satisfaction: 4.8, note: '91% reported reduced blackheads in 3 weeks' },
        { profile: 'acne_prone', satisfaction: 4.6, note: 'Pore-clearing effect confirmed by 84% of users' },
      ],
      not_ideal_for: [{ profile: 'dry or compromised skin', reason: 'BHA exfoliation can increase dryness without moisturizer follow-up' }],
      top_insights: [
        '91% of oily-skin users saw reduced blackheads within 3 weeks',
        'Best results when used 3×/week not daily — 68% users over-used initially',
        'Pairs well with niacinamide serum — 76% users combine both',
      ],
      common_questions: [
        { question: 'Can I use it daily?', answer: 'Start 3×/week. Only 22% of daily users reported better results vs 3×/week.' },
        { question: 'Can I use it with Niacinamide Serum?', answer: 'Yes — 76% of users combine both with great results.' },
      ],
      education_gaps: [{ mistake: 'Using daily instead of 3x per week', percentage: 42, tip: 'BHA needs rest days. Use Mon/Wed/Fri for best results without over-exfoliation.' }],
      issue_summary: [{ issue: 'Dryness when used daily', percentage: 18, severity: 'mild' as const, is_dealbreaker: false }],
    },
    {
      product_name: 'SPF 50 PA++++ Sunscreen',
      brand_name: 'Minimalist',
      category: 'skincare_sunscreen',
      total_verified_conversations: 61,
      voice_trust_score: 88,
      avg_texture: 4.7, avg_effectiveness: 4.8, avg_fragrance: 4.3, avg_value: 4.9, avg_packaging: 4.5,
      sentiment_distribution: { positive: 52, neutral: 6, negative: 3 },
      repurchase_distribution: { definitely_yes: 42, probably_yes: 14, unsure: 3, probably_no: 2, definitely_no: 0 },
      works_best_for: [
        { profile: 'all_skin_types', satisfaction: 4.8, note: 'No white cast on medium-to-dark skin tones' },
        { profile: 'oily_skin', satisfaction: 4.9, note: 'Matte finish — 96% preferred over previous sunscreen' },
      ],
      not_ideal_for: [{ profile: 'very dry skin', reason: 'Matte finish may feel tight without a moisturizer underneath' }],
      top_insights: [
        'No white cast — top reason 89% switched from their previous SPF',
        'Wears well under makeup for 8+ hours per 78% of users',
        'PA++++ rating trusted more than most Indian brands at this price',
      ],
      common_questions: [
        { question: 'Does it leave a white cast?', answer: '89% of users reported no white cast, even on NC40+ skin tones.' },
        { question: 'Can I use it under makeup?', answer: '78% use it under foundation daily with no pilling.' },
      ],
      education_gaps: [{ mistake: 'Not reapplying after 2 hours outdoors', percentage: 58, tip: 'Reapply every 2 hours in direct sun for SPF protection to hold.' }],
      issue_summary: [{ issue: 'Slight stinging around eyes', percentage: 6, severity: 'mild' as const, is_dealbreaker: false }],
    },
    {
      product_name: 'Full Damage Repair Shampoo',
      brand_name: 'Plum',
      category: 'haircare_shampoo',
      total_verified_conversations: 38,
      voice_trust_score: 76,
      avg_texture: 4.3, avg_effectiveness: 4.4, avg_fragrance: 4.7, avg_value: 4.5, avg_packaging: 4.2,
      sentiment_distribution: { positive: 28, neutral: 7, negative: 3 },
      repurchase_distribution: { definitely_yes: 20, probably_yes: 13, unsure: 3, probably_no: 2, definitely_no: 0 },
      works_best_for: [
        { profile: 'damaged_hair', satisfaction: 4.6, note: '82% noticed reduced breakage after 4 weeks' },
        { profile: 'color_treated', satisfaction: 4.4, note: 'Sulphate-free formula preserved color vibrancy' },
      ],
      not_ideal_for: [{ profile: 'very oily scalp', reason: 'Rich formula may require double wash for oily scalps' }],
      top_insights: [
        'Bamboo extract visibly reduced split ends for 74% of users',
        'Fragrance rated best-in-class — 91% loved the scent',
        'Sulphate-free: colour stays 2–3 washes longer than regular shampoo',
      ],
      common_questions: [
        { question: 'Is it sulphate-free?', answer: 'Yes — 91% of colour-treated hair users reported less fade vs. regular shampoo.' },
        { question: 'How often should I use it?', answer: '68% of users with normal-dry hair wash 2-3x per week for best results.' },
      ],
      education_gaps: [{ mistake: 'Applying directly to roots without diluting', percentage: 29, tip: 'Dilute a small amount in water first for even distribution on scalp.' }],
      issue_summary: [{ issue: 'Lather feels lower than regular shampoo', percentage: 22, severity: 'mild' as const, is_dealbreaker: false }],
    },
    {
      product_name: 'Full Damage Repair Conditioner',
      brand_name: 'Plum',
      category: 'haircare_conditioner',
      total_verified_conversations: 34,
      voice_trust_score: 78,
      avg_texture: 4.5, avg_effectiveness: 4.5, avg_fragrance: 4.6, avg_value: 4.4, avg_packaging: 4.1,
      sentiment_distribution: { positive: 26, neutral: 6, negative: 2 },
      repurchase_distribution: { definitely_yes: 19, probably_yes: 12, unsure: 2, probably_no: 1, definitely_no: 0 },
      works_best_for: [
        { profile: 'dry_damaged_hair', satisfaction: 4.7, note: '86% noticed detangling improvement after first use' },
        { profile: 'frizzy_hair', satisfaction: 4.5, note: 'Humidity resistance confirmed by 79% of users' },
      ],
      not_ideal_for: [{ profile: 'fine hair', reason: 'Rich formula can weigh down very fine or limp hair' }],
      top_insights: [
        '86% noticed easier detangling from first wash',
        'Frizz control lasts through humid days per 79% of users',
        'Apply mid-length to ends only — roots don't need conditioner',
      ],
      common_questions: [
        { question: 'Should I apply it to roots?', answer: 'No — 88% of users with best results apply only mid-length to ends.' },
        { question: 'How long should I leave it on?', answer: '3-5 minutes is optimal — 2 minutes showed 40% lower efficacy in user reports.' },
      ],
      education_gaps: [{ mistake: 'Applying conditioner to the scalp/roots', percentage: 44, tip: 'Apply only from mid-length to ends. Scalp produces natural oils that conditioner disrupts.' }],
      issue_summary: [{ issue: 'Buildup if overused on fine hair', percentage: 12, severity: 'mild' as const, is_dealbreaker: false }],
    },
  ];

  // Delete existing demo products first
  for (const dp of demoProducts) {
    await db.from('marketplace_products')
      .delete()
      .eq('product_name', dp.product_name)
      .eq('brand_name', dp.brand_name);
  }

  const { error: demoErr } = await db.from('marketplace_products').insert(demoProducts);
  if (demoErr) console.error('[seed] demo products insert failed:', demoErr.message);

  return NextResponse.json({
    success: true,
    campaigns: 2,
    callRecords: callRecordsInserted,
    productIntelligence: piInserted,
    marketplaceProducts: 2 + (demoErr ? 0 : demoProducts.length),
  });
}
