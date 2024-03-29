export const roundNumber = (number: number, decimal = 2): number => {
  return +number?.toFixed(decimal) || null
}
