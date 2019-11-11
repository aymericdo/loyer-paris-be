const regex = {
    address: /([0-9]* )?(rue|avenue|passage|boulevard|faubourg|allee|quai|place|jardin|impasse|square|bd) (?!(calme|tranquille)\b)( ?[a-zA-Z'’-]+){0,3}/g,
    postalCode: /\b75[0-9]{3}\b/g,
    postalCode2: /((?<=paris )[0-9]{1,2})|([0-9]{1,2} ?(?=er|ème|e))/g,
    roomCount: /([0-9]*|un|deux|trois|quatre|cinq|six|sept)? ?((piece))/g,
    furnished: /(?<!(non-|non ))\bmeuble/g
}

module.exports = (value) => {
    if (Object.keys(regex).includes(value)) {
        return regex[value]
    } else {
        return null
    }
}
