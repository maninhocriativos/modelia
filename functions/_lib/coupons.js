export function isFullDiscountCoupon(env, coupon) {
  const expected = normalizeCoupon(env.FULL_DISCOUNT_COUPON || "");
  return Boolean(expected) && normalizeCoupon(coupon) === expected;
}

export function normalizeCoupon(value) {
  return String(value || "").trim().toUpperCase().replace(/\s+/g, "");
}

export function maskCoupon(value) {
  const normalized = normalizeCoupon(value);
  if (normalized.length <= 4) return "****";
  return `${normalized.slice(0, 2)}***${normalized.slice(-2)}`;
}
