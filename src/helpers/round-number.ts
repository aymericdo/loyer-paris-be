export const roundNumber = (number: number, decimal: number = 2): number => {
  return +number?.toFixed(decimal) || null
}
