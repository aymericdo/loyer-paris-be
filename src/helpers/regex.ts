export const regexString = (value: string): string => {
    const regex = {
        address: /([0-9]+,?)? ?((bis|b|ter),?)? ?(rue|avenue|passage|boulevard|faubourg|allee|quai|place|jardin|impasse|square|bd|cite) (?!(calme|tranquille)\b)( ?[a-zA-Z'’-]+){0,3}/g,
        roomCount: /([1-5]|un|deux|trois|quatre|cinq|six|sept)(?= ?(piece))/g,
        furnished: /(?<!(non-|non ))\bmeuble/g,
        nonFurnished: /(non-|non )\bmeuble/g,
        charges: /((?<=(charges locatives |charges |charge )(\D{0,4}))|(?<=\d{3,4}((|\.|,)\d{1,2})?(\D{0,5})?\+ ?))(\d{2,3}((|\.|,)\d{1,2})?)(?=( ?euros\b| ?€| ?e\b| ?eur\b| ?euro\b | ?(charge(s)?)\b))/g,
        surface: /(9|\d{2})(?= ?(m2\b|metre|m²))/g,
    }

    if (Object.keys(regex).includes(value)) {
        return regex[value]
    } else {
        return null
    }
}
