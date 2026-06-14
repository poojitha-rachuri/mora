-- TrueGlow Seed Data (schema v2)

insert into marketplace_products (
  product_name, brand_name, category,
  total_verified_conversations, voice_trust_score,
  avg_texture, avg_effectiveness, avg_fragrance, avg_value, avg_packaging,
  sentiment_distribution, repurchase_distribution,
  works_best_for, not_ideal_for,
  top_insights, common_questions, education_gaps, issue_summary
) values
(
  'Glow Serum Pro', 'LumiSkin', 'skincare_serum',
  142, 87.0,
  4.2, 4.5, 3.9, 4.1, 4.4,
  '{"positive":108,"neutral":24,"negative":10}'::jsonb,
  '{"definitely_yes":68,"probably_yes":43,"unsure":18,"probably_no":9,"definitely_no":4}'::jsonb,
  '[{"profile":"oily skin","satisfaction":4.6,"note":"91% reported reduced shine within 3 weeks"},
    {"profile":"combination skin","satisfaction":4.3,"note":"85% positive results on T-zone balance"}]'::jsonb,
  '[{"profile":"very dry skin","reason":"Lightweight formula may not provide enough moisture"},
    {"profile":"sensitive skin","reason":"High Vit C concentration causes initial tingling for ~18% of users"}]'::jsonb,
  '["78% of users saw visible brightening within 4 weeks of consistent use",
    "Oily-skin users are 2× more likely to repurchase vs dry-skin users",
    "Texture scores dropped when customers layered over heavy moisturizer — best applied to bare skin"]'::jsonb,
  '[{"question":"How long before I see results?","answer":"Most callers reported visible brightening in 3–4 weeks of consistent morning use."},
    {"question":"Can I use it with retinol?","answer":"Best used in the morning; apply retinol at night to avoid irritation."}]'::jsonb,
  '[{"mistake":"Applying after moisturizer","percentage":31,"tip":"Apply to clean skin before moisturizer for best absorption"},
    {"mistake":"Skipping nights","percentage":22,"tip":"Evening use doubles brightening speed — consistency is key"}]'::jsonb,
  '[{"issue":"Initial tingling on sensitive skin","percentage":13,"severity":"mild","is_dealbreaker":false},
    {"issue":"Oxidizes if left open","percentage":8,"severity":"moderate","is_dealbreaker":false}]'::jsonb
),
(
  'HydraBoost Moisturizer', 'AquaDerm', 'skincare_moisturizer',
  98, 82.0,
  4.6, 4.0, 4.3, 4.2, 4.0,
  '{"positive":72,"neutral":18,"negative":8}'::jsonb,
  '{"definitely_yes":45,"probably_yes":26,"unsure":18,"probably_no":6,"definitely_no":3}'::jsonb,
  '[{"profile":"dry skin","satisfaction":4.7,"note":"89% reported all-day hydration"},
    {"profile":"normal skin","satisfaction":4.2,"note":"82% positive results"}]'::jsonb,
  '[{"profile":"oily skin","reason":"Gel-cream texture may feel heavy under makeup for oily skin types"},
    {"profile":"acne-prone skin","reason":"Some users reported mild breakouts in the first 2 weeks"}]'::jsonb,
  '["72% repurchase rate — highest in the moisturizer segment for this price range",
    "Dry-skin users gave texture 4.7/5; oily-skin users averaged 3.4/5",
    "Users who applied it within 60 seconds of washing had 40% better hydration retention"]'::jsonb,
  '[{"question":"Is it suitable for oily skin?","answer":"It works best for dry to normal skin. Oily skin users may prefer applying only at night."},
    {"question":"Can I use it under SPF?","answer":"Yes — 67% of callers use it as a moisturizer base before sunscreen."}]'::jsonb,
  '[{"mistake":"Using too much product","percentage":28,"tip":"A pea-sized amount is enough — over-application causes the tackiness some users reported"},
    {"mistake":"Not waiting before applying SPF","percentage":18,"tip":"Wait 60 seconds for the gel texture to absorb before layering sunscreen"}]'::jsonb,
  '[{"issue":"Slight tackiness in humid weather","percentage":14,"severity":"mild","is_dealbreaker":false},
    {"issue":"Pump clogs after 2-3 months","percentage":9,"severity":"mild","is_dealbreaker":false}]'::jsonb
),
(
  'ClearSkin Toner', 'PoreMinimize', 'skincare_toner',
  67, 74.0,
  4.0, 4.1, 3.7, 4.3, 3.8,
  '{"positive":42,"neutral":16,"negative":9}'::jsonb,
  '{"definitely_yes":28,"probably_yes":16,"unsure":14,"probably_no":6,"definitely_no":3}'::jsonb,
  '[{"profile":"oily skin","satisfaction":4.4,"note":"94% reported fewer visible pores after 2 weeks"},
    {"profile":"acne-prone skin","satisfaction":4.2,"note":"87% saw fewer breakouts within a month"}]'::jsonb,
  '[{"profile":"dry skin","reason":"Salicylic Acid content is drying without a rich moisturizer follow-up"},
    {"profile":"rosacea-prone skin","reason":"Witch Hazel triggers flushing in ~12% of users with rosacea"}]'::jsonb,
  '["65% of oily-skin users reported fewer breakouts within 2 weeks",
    "Best value-for-money toner in the under-₹1000 segment based on voice feedback",
    "Users who used it twice daily saw 2× faster results vs once-daily users"]'::jsonb,
  '[{"question":"How often should I use it?","answer":"Once daily (evening) for sensitive skin; twice daily for oily or acne-prone skin."},
    {"question":"Can I use it around my eyes?","answer":"No — avoid the eye area. 3 callers reported mild stinging when it contacted the eye contour."}]'::jsonb,
  '[{"mistake":"Applying without moisturizer follow-up","percentage":34,"tip":"Always follow with a moisturizer to prevent over-drying, especially for combination skin"},
    {"mistake":"Using on broken or active pimples","percentage":19,"tip":"Avoid open lesions — use a targeted spot treatment instead and apply toner to surrounding skin"}]'::jsonb,
  '[{"issue":"Drying effect with daily use","percentage":22,"severity":"mild","is_dealbreaker":false},
    {"issue":"Strong scent for some users","percentage":11,"severity":"mild","is_dealbreaker":false}]'::jsonb
)
on conflict (product_name, brand_name) do nothing;

-- Sample completed campaign
insert into campaigns (
  campaign_name, brand_name, product_name, category,
  status, total_contacts, completed_calls
) values (
  'LumiSkin Q2 Feedback', 'LumiSkin', 'Glow Serum Pro', 'skincare_serum',
  'completed', 150, 142
) on conflict do nothing;
