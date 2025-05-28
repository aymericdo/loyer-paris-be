export const regexString = (value: string): RegExp => {
  const regex = {
    address:
      /([0-9]+,?)? ?((bis|b|ter),?)?(rue|avenue|passage|boulevard|faubourg|allee|quai|impasse|square|bd|cite) ?( ?[a-zA-Z'’-]+){0,4}/g,
    roomCount: /([1-5]|un|deux|trois|quatre|cinq|six|sept)(?= ?(piece))/g,
    furnished: /(?<!(non-|non ))\bmeuble/g,
    nonFurnished: /(non-|non )\bmeuble/g,
    charges:
      /((?<=((?<! hors )charges locatives |(?<! hors )charges |(?<! hors )charge )(\D{0,4}))|(?<=\d{3,4}((|\.|,)\d{1,2})?(\D{0,5})?\+ ?))(\d{2,3}((|\.|,)\d{1,2})?)(?=( ?euros\b| ?€| ?e\b| ?eur\b| ?euro\b | ?de\b ?(charge(s)?)\b))/g,
    rentComplement:
      /((?<=(complement de loyer )(\D{0,4})))(\d{2,3}((|\.|,)\d{1,2})?)(?=( ?euros\b| ?€| ?e\b| ?eur\b| ?euro\b | ?de\b ?(charge(s)?)\b))/ig,
    hasCharges: /prix charge[s]? comprise[s]?/ig,
    surface: /((9|\d{2})((|\.|,)\d{1,2})?)(?= ?(m2\b|metre|m²))/ig,
    isHouse: /maison/ig,
    particulier: /particulier/ig,
    colocation: /\bcolocation\b(?![^.!?]{0,50}\b(interdite|impossible|refusée|non\s?autorisée|interdiction)\b)/ig,
  }

  if (Object.keys(regex).includes(value)) {
    return regex[value]
  } else {
    return null
  }
}

export const getFirstMatchResult = (text: string, regex: RegExp): string => {
  return (text?.match(regex) && text.match(regex)[0])
}
