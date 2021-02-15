export function string(string: string): string {
    return string?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()
}

export function price(price: string): number {
    const match = price?.replace(/\s|\.|,/g, '').match(/\d+/g)
    return match != null ? +match[0] : null
}

export function number(number: string): number {
    const match = number?.replace(/,/g, '.').match(/\d+((\.|,|)\d+)?/g)
    return match != null ? +match[0] : null
}

export function address(string: string): string {
    const blackList = ['commercante', 'navette']
    if (blackList.some(w => string.includes(w))) return null
    return string.trim().replace('bd ', 'boulevard ')
}
