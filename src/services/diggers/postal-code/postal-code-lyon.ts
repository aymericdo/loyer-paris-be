import { DefaultPostalCodeStrategy } from '@services/diggers/postal-code/postal-code-default'
import { AvailableCities, cityList } from '@services/filters/city-filter/valid-cities-list'

export class LyonPostalCodeStrategy extends DefaultPostalCodeStrategy {
  protected digForPostalCode2(city: AvailableCities, text: string): string {
    const postalCode2Re = city === 'lyon' && new RegExp(cityList[city].postalCodeRegex[1])
    const match = text.match(postalCode2Re) && text.match(postalCode2Re)[0]
    return match ? (match.trim().length === 1 ? `6900${match.trim()}` : `690${match.trim()}`) : null
  }
}
