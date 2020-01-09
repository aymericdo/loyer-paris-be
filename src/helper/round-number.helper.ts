module.exports = (number, decimal = 2) => {
    return number && typeof number === 'number' && +(number).toFixed(decimal)
}
