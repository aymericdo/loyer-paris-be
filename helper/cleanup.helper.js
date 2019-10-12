function string(string) {
    return string && string.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function price(price) {
    return price && price.replace(/\s|\.|,/g, '').match(/\d+/g)[0]
}

function number(number) {
    return number && number.match(/\d+/g)[0]
}

module.exports = {
    string,
    price,
    number,
}
