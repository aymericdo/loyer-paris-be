const regex = {
    address: /([0-9]* )?((rue|avenue|passage|boulevard|faubourg|allee|quai|place|jardin|impasse|square))( [a-zA-Z'-]+){0,2}/g,
    postalCode: /\b75[0-9]{3}\b/g,
    neighborhood: /(?<=paris )[0-9]{1,2}/g,
    roomCount: /([0-9]*|un|deux|trois|quatre|cinq|six|sept)? ?((piece))/g,
    furnished: /(?<!(non-|non ))\bmeuble/g
}

module.exports = function (value) {
    if (Object.keys(regex).includes(value)) {
        return regex[value]
    } else {
        return null
    }
}