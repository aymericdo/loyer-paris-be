import { AvailableCities } from '@services/address/city'

export function string(string: string): string {
  return string
    ?.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

export function price(price: string): number {
  const match = price?.replace(/\s|\.|,/g, '').match(/\d+/g)
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
    .replace(city as string, '')
    .trim()
}
