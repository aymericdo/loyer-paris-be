import { AvailableCities } from '@services/city-config/classic-cities'

export function string(string: string): string {
  return string
    ?.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\n/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function price(price: string): number {
  let match = price
    ?.replace(/\s|/g, '')
    .replace(',', '.')
    .match(/\d+(\.\d{1,2})?/g)
  if (
    match?.length === 2 &&
    match[0].length === 4 &&
    match[0][1] === '.' &&
    match[1].length === 1
  ) {
    // manage this kind of "€1,500 / Month"
    match = [match.join('').replace('.', '')]
  }

  return match != null ? +match[0] : null
}

export function number(number: string): number {
  const match = number?.replace(/,/g, '.').match(/\d+((\.|,|)\d+)?/g)
  return match != null ? +match[0] : null
}

export function streetNumber(address: string): number {
  const match = string(address)?.match(/^\d+(b|t)?/g)
  return match != null ? +match[0] : null
}

export function address(string: string, city: AvailableCities): string {
  const blackList = ['commercante', 'navette', 'calme', 'tranquille', 'parking']
  if (blackList.some((w) => string.includes(w))) return null
  return string
    .replace('bd ', 'boulevard ')
    .replace(city as string, '') // remove the city from the postal address
    .trim()
}
