export function getPriceExcludingCharges(
  price: number,
  charges: number,
  hasCharges: boolean,
): number {
  const defaultCharges = hasCharges ? price * 0.1 : 0
  let currentCharges = 0

  if (charges) {
    if (charges > price * 0.5) {
      // charge invalid
      currentCharges = defaultCharges
    } else {
      currentCharges = charges
    }
  } else {
    currentCharges = defaultCharges
  }

  return price - currentCharges
}
