import { PostalCodeDefault } from '@services/diggers/postal-code/encadrement-postal-code-default'
import { AvailableCities } from '@services/filters/city-filter/city-list'

export class PostalCodeLyon extends PostalCodeDefault {
  protected postalCodePossibilities = {
    lyon: {
      postalCodes: ['69001', '69002', '69003', '69004', '69005', '69006', '69007', '69008', '69009', '69100'],
      regex: [/\b690[0-9]{2}\b/g, /((?<=lyon )[0-9]{1})|([0-9]{1} ?(?=er|ème|e|eme))/g],
    },
    villeurbanne: {
      postalCodes: ['69100'],
      regex: [/\b69100\b/g],
    },
  }

  protected digForPostalCode2(city: AvailableCities, text: string): string {
    const postalCode2Re = city === 'lyon' && new RegExp(this.postalCodePossibilities[city].regex[1])
    const match = text.match(postalCode2Re) && text.match(postalCode2Re)[0]
    return match ? (match.trim().length === 1 ? `6900${match.trim()}` : `690${match.trim()}`) : null
  }
}
