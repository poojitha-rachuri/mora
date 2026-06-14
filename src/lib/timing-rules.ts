export interface TimingRule {
  min: number;
  max: number;
  label: string;
  reason: string;
}

const TIMING_RULES: Record<string, TimingRule> = {
  skincare_serum: {
    min: 14,
    max: 21,
    label: '14-21 days after purchase',
    reason: 'Serums need 2-3 weeks for visible results like reduced pores or even skin tone',
  },
  skincare_moisturizer: {
    min: 7,
    max: 14,
    label: '7-14 days after purchase',
    reason: 'Hydration effects are felt within the first week of consistent use',
  },
  skincare_cleanser: {
    min: 7,
    max: 10,
    label: '7-10 days after purchase',
    reason: 'Cleansers are used daily; feedback on texture and feel develops within a week',
  },
  skincare_toner: {
    min: 7,
    max: 14,
    label: '7-14 days after purchase',
    reason: 'Pore-tightening and balancing effects visible after consistent daily use',
  },
  skincare_sunscreen: {
    min: 3,
    max: 7,
    label: '3-7 days after purchase',
    reason: 'Finish, white cast, and skin feel are apparent from the first application',
  },
  skincare_mask: {
    min: 7,
    max: 14,
    label: '7-14 days after purchase',
    reason: 'Mask results (glow, pores) are noticeable after 3-5 uses',
  },
  skincare_eye: {
    min: 21,
    max: 30,
    label: '21-30 days after purchase',
    reason: 'Under-eye results like dark circle reduction take 3-4 weeks',
  },
  haircare_shampoo: {
    min: 7,
    max: 14,
    label: '7-14 days after purchase',
    reason: 'Scalp health and hair texture changes are noticeable within 2 weeks',
  },
  haircare_conditioner: {
    min: 7,
    max: 14,
    label: '7-14 days after purchase',
    reason: 'Frizz control and softness feedback is available after a few washes',
  },
  haircare_oil: {
    min: 14,
    max: 21,
    label: '14-21 days after purchase',
    reason: 'Hair oil benefits like shine and reduced breakage take 2-3 weeks of use',
  },
  haircare_serum: {
    min: 7,
    max: 10,
    label: '7-10 days after purchase',
    reason: 'Frizz control serums show results immediately and consistently within a week',
  },
  haircare_treatment: {
    min: 14,
    max: 28,
    label: '14-28 days after purchase',
    reason: 'Protein treatments and bond repair need multiple sessions to show results',
  },
  bodycare_lotion: {
    min: 7,
    max: 14,
    label: '7-14 days after purchase',
    reason: 'Body hydration and skin softness are noticeable within a week',
  },
  bodycare_wash: {
    min: 5,
    max: 10,
    label: '5-10 days after purchase',
    reason: 'Fragrance, lather, and skin feel feedback is available after a few uses',
  },
  lip_care: {
    min: 5,
    max: 7,
    label: '5-7 days after purchase',
    reason: 'Lip hydration and healing are felt within the first few days',
  },
};

const DEFAULT_TIMING: TimingRule = {
  min: 7,
  max: 14,
  label: '7-14 days after purchase',
  reason: 'Standard feedback window for most beauty products',
};

export function getTimingRule(category: string): TimingRule {
  return TIMING_RULES[category] ?? DEFAULT_TIMING;
}
