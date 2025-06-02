import { Ad } from '@interfaces/ad'
import { AvailableCities, AvailableMainCities, getCityList } from '@services/city-config/list'
import { postalCodes } from '@services/city-config/postal-codes'
import { hasArrondissement } from '@services/city-config/has-arrondissement'

export class PostalCodeService {
  private mainCity: AvailableMainCities
  protected city: AvailableCities | 'all'

  constructor(mainCity: AvailableMainCities, city: AvailableCities | 'all') {
    this.mainCity = mainCity
    this.city = city
  }

  getPostalCodePossibilities(): string[] {
    if (this.city === 'all') {
      return getCityList(this.mainCity).flatMap(city => postalCodes(city))
    } else {
      return postalCodes(this.city)
    }
  }

  getPostalCode(ad: Ad): string {
    return ad.postalCode || this.digForPostalCode(ad)
  }

  protected digForPostalCode(ad: Ad): string {
    const postalCodePossibilities: string[] = this.getPostalCodePossibilities()
    if (postalCodePossibilities?.length === 1) {
      return postalCodePossibilities[0]
    }

    const postalCode =
      (ad.cityLabel && this.startOfPostalCodeFromText(ad.cityLabel, postalCodePossibilities)) ||
      (ad.title && this.startOfPostalCodeFromText(ad.title, postalCodePossibilities)) ||
      (ad.description && this.startOfPostalCodeFromText(ad.description, postalCodePossibilities))

    return postalCode && postalCodePossibilities.includes(postalCode.toString()) ? postalCode : null
  }

  protected startOfPostalCodeFromText(text: string, codes: string[]): string {
    if (this.city === 'all') return null

    const startOfPostalCode = codes[0].slice(0, 2)

    let regex = null
    if (codes.length === 1) {
      regex = new RegExp(codes[0], 'gi')
    } else {
      regex = new RegExp(`${startOfPostalCode}[0-9]{3}`, 'gi')
    }

    const match = text.match(regex)
    const matchedPostalCode = match && match[0].trim()

    if (matchedPostalCode) {
      return matchedPostalCode
    }

    if (hasArrondissement(this.city)) {
      const arrondissementRegex = new RegExp(
        `((?<=${this.city} )\\d{1,2})|(\\d{1,2}(?= ?(er|ème|e|eme)))`,
        'gi'
      )

      const match = text.match(arrondissementRegex)

      if (match) {
        for (const m of match) {
          const arrondissementNumber = m.replace(/ ?(er|ème|e|eme)/i, '').padStart(3, '0')
          const possiblePostal = `${startOfPostalCode}${arrondissementNumber}`
          if (codes.includes(possiblePostal)) return possiblePostal
        }
      }
    }

    return null
  }
}
