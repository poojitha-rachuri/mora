const CATEGORY_KEYWORDS: Record<string, string[]> = {
  skincare_serum: ['serum', 'niacinamide', 'vitamin c', 'retinol', 'hyaluronic', 'brightening', 'essence'],
  skincare_moisturizer: ['moisturizer', 'moisturiser', 'cream', 'lotion', 'gel cream', 'day cream', 'night cream', 'hydrating'],
  skincare_cleanser: ['face wash', 'cleanser', 'foaming wash', 'gel wash', 'cleansing', 'facewash'],
  skincare_toner: ['toner', 'toning', 'mist', 'hydrating toner', 'clarifying toner'],
  skincare_sunscreen: ['sunscreen', 'spf', 'sunblock', 'sun protection', 'uv'],
  skincare_mask: ['face mask', 'sheet mask', 'clay mask', 'sleeping mask', 'peel off'],
  skincare_eye: ['eye cream', 'eye serum', 'eye gel', 'under eye', 'dark circles'],
  haircare_shampoo: ['shampoo', 'hair wash', 'cleansing shampoo', 'anti-dandruff shampoo'],
  haircare_conditioner: ['conditioner', 'hair conditioner', 'deep conditioner', 'hair mask'],
  haircare_oil: ['hair oil', 'onion oil', 'coconut oil', 'argan oil', 'scalp oil', 'growth oil'],
  haircare_serum: ['hair serum', 'frizz serum', 'smoothing serum', 'heat protectant'],
  haircare_treatment: ['hair treatment', 'keratin', 'protein treatment', 'hair spa', 'bond repair'],
  bodycare_lotion: ['body lotion', 'body cream', 'body butter', 'body moisturizer', 'body milk'],
  bodycare_wash: ['body wash', 'shower gel', 'bathing bar', 'soap'],
  lip_care: ['lip balm', 'lip scrub', 'lip mask', 'lip butter', 'lip serum'],
};

export function detectCategory(productName: string): string {
  const lower = productName.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return category;
    }
  }
  return 'unknown';
}

export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    skincare_serum: 'Skincare Serum',
    skincare_moisturizer: 'Moisturizer',
    skincare_cleanser: 'Face Cleanser',
    skincare_toner: 'Toner',
    skincare_sunscreen: 'Sunscreen',
    skincare_mask: 'Face Mask',
    skincare_eye: 'Eye Care',
    haircare_shampoo: 'Shampoo',
    haircare_conditioner: 'Conditioner',
    haircare_oil: 'Hair Oil',
    haircare_serum: 'Hair Serum',
    haircare_treatment: 'Hair Treatment',
    bodycare_lotion: 'Body Lotion',
    bodycare_wash: 'Body Wash',
    lip_care: 'Lip Care',
    unknown: 'Beauty Product',
  };
  return labels[category] ?? 'Beauty Product';
}
