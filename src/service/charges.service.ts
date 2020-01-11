export function subCharges(price, charges, hasCharges) {
    return !!charges ? price - charges : hasCharges ? price - (10 * price / 100) : price
}
