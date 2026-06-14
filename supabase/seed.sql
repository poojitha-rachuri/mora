-- TrueGlow Seed Data
-- Sample marketplace products with aggregated voice intelligence data

INSERT INTO marketplace_products (
  product_name, brand_name, product_category, price_inr, description,
  voice_trust_score, verified_call_count,
  avg_satisfaction_overall, avg_satisfaction_efficacy, avg_satisfaction_texture,
  avg_satisfaction_scent, avg_satisfaction_packaging, avg_satisfaction_value,
  repurchase_rate, nps_average,
  works_best_for, may_not_suit, insight_statements, common_qa, top_issues,
  skin_type_breakdown, outcome_breakdown
) VALUES
(
  'Glow Serum Pro', 'LumiSkin', 'serum', 2499.00,
  'Advanced brightening serum with Vitamin C and Niacinamide for radiant, even-toned skin.',
  87, 142,
  4.3, 4.5, 4.2, 3.9, 4.4, 4.1,
  78.5, 8.2,
  '[{"profile": "Oily skin, 25-35", "reason": "Controls sebum while brightening", "match_pct": 91},
    {"profile": "Combination skin", "reason": "Balances T-zone without over-drying", "match_pct": 85},
    {"profile": "Dull/uneven skin tone", "reason": "Visible brightening within 3-4 weeks", "match_pct": 88}]',
  '[{"profile": "Very dry skin", "reason": "May feel drying without added moisturizer"},
    {"profile": "Sensitive skin", "reason": "High Vit C concentration may cause initial tingling"}]',
  '[{"text": "78% of users saw visible brightening within 4 weeks", "stat": "78%", "category": "efficacy"},
    {"text": "Most users apply morning and evening", "stat": "2x/day", "category": "usage"},
    {"text": "Repurchase rate is nearly 4 in 5 users", "stat": "79%", "category": "loyalty"}]',
  '[{"question": "How long before I see results?", "answer": "Most callers reported visible brightening in 3-4 weeks of consistent use.", "frequency": 38},
    {"question": "Can I use it with retinol?", "answer": "Best used in the morning; use retinol at night to avoid irritation.", "frequency": 22}]',
  '[{"issue": "Initial tingling on sensitive skin", "frequency": 18, "severity": "low"},
    {"issue": "Oxidizes if not stored properly", "frequency": 12, "severity": "medium"}]',
  '{"oily": 42, "combination": 33, "dry": 15, "normal": 10}',
  '{"satisfied": 72, "churned": 8, "issue_reported": 12, "gift_buyer": 8}'
),
(
  'HydraBoost Moisturizer', 'AquaDerm', 'moisturizer', 1299.00,
  'Lightweight gel-cream moisturizer with Hyaluronic Acid for all-day hydration.',
  82, 98,
  4.1, 4.0, 4.6, 4.3, 4.0, 4.2,
  72.3, 7.6,
  '[{"profile": "Dry to normal skin", "reason": "Deep hydration without greasiness", "match_pct": 89},
    {"profile": "Humid climates", "reason": "Gel texture absorbs quickly", "match_pct": 82}]',
  '[{"profile": "Acne-prone skin", "reason": "Some users reported mild breakouts initially"},
    {"profile": "Very oily skin", "reason": "May feel slightly heavy under makeup"}]',
  '[{"text": "72% repurchase rate — highest in the moisturizer category", "stat": "72%", "category": "loyalty"},
    {"text": "Users love the non-greasy finish for daytime use", "stat": "4.6/5 texture", "category": "texture"}]',
  '[{"question": "Is it suitable for oily skin?", "answer": "It works best for dry to normal skin; oily skin users may prefer the lighter version.", "frequency": 31}]',
  '[{"issue": "Slight tackiness in very humid weather", "frequency": 14, "severity": "low"},
    {"issue": "Pump dispenser clogs occasionally", "frequency": 9, "severity": "low"}]',
  '{"dry": 48, "normal": 30, "combination": 16, "oily": 6}',
  '{"satisfied": 68, "churned": 12, "issue_reported": 14, "cross_sell": 6}'
),
(
  'ClearSkin Toner', 'PoreMinimize', 'toner', 799.00,
  'Alcohol-free toner with Salicylic Acid and Witch Hazel for clear, pore-minimized skin.',
  74, 67,
  3.9, 4.1, 4.0, 3.7, 3.8, 4.3,
  65.0, 7.1,
  '[{"profile": "Oily/acne-prone skin", "reason": "Reduces visible pores and controls shine", "match_pct": 94},
    {"profile": "Teens and young adults", "reason": "Effective for hormonal breakouts", "match_pct": 87}]',
  '[{"profile": "Dry or sensitive skin", "reason": "Salicylic Acid can be drying"},
    {"profile": "Rosacea-prone skin", "reason": "Witch Hazel may trigger flushing"}]',
  '[{"text": "65% of users reported fewer breakouts within 2 weeks", "stat": "65%", "category": "efficacy"},
    {"text": "Best value-for-money toner in the budget segment", "stat": "4.3/5 value", "category": "value"}]',
  '[{"question": "How often should I use it?", "answer": "Once daily (evening) for sensitive skin; twice daily for oily/acne-prone.", "frequency": 28}]',
  '[{"issue": "Slight drying effect with daily use", "frequency": 22, "severity": "medium"},
    {"issue": "Scent is too strong for some users", "frequency": 11, "severity": "low"}]',
  '{"oily": 61, "combination": 28, "normal": 8, "dry": 3}',
  '{"satisfied": 58, "churned": 18, "issue_reported": 19, "cross_sell": 5}'
)
ON CONFLICT DO NOTHING;

-- Sample demo campaign
INSERT INTO campaigns (
  name, product_name, product_category, brand_name, status,
  total_contacts, calls_completed, calls_failed
) VALUES (
  'LumiSkin Q2 Feedback Campaign', 'Glow Serum Pro', 'serum', 'LumiSkin',
  'completed', 150, 142, 8
)
ON CONFLICT DO NOTHING;
