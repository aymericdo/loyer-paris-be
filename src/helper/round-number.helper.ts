export const roundNumber = (number, decimal = 2) => {
    return number && typeof number === 'number' && +(number).toFixed(decimal)
}
