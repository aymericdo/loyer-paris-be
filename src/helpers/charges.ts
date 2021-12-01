export function getPriceExcludingCharges(
  price: number,
  charges: number,
  hasCharges: boolean
): number {
  return charges && (price - charges > 0)
    ? price - charges
    : hasCharges
      ? price - (10 * price) / 100
      : price
}
