export function string(string) {
    return string && typeof string === 'string' && string.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()
}

export function price(price) {
    return price && price.replace(/\s|\.|,/g, '').match(/\d+/g) && +price.replace(/\s|\.|,/g, '').match(/\d+/g)[0]
}

export function number(number) {
    return number && number.match(/\d+((\.|,|)\d+)?/g) && +number.replace(/,/g, '.').match(/\d+((\.|,|)\d+)?/g)[0]
}
