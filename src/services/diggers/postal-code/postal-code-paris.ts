import { PostalCodeDefault } from '@services/diggers/postal-code/encadrement-postal-code-default'
import { AvailableCities } from '@services/filters/city-filter/city-list'

export class PostalCodeParis extends PostalCodeDefault {
  protected postalCodePossibilities = {
    paris: {
      postalCodes: [
        '75001', '75002', '75003', '75004', '75005', '75006', '75007', '75008', '75009', '75010',
        '75011', '75012', '75013', '75014', '75015', '75016', '75116', '75017', '75018', '75019', '75020',
      ],
      regex: [/\b75[0-1][0-9]{2}\b/g, /((?<=paris )[0-9]{1,2})|([0-9]{1,2} ?(?=er|ème|e|eme))/g],
    },
  }

  protected digForPostalCode2(city: AvailableCities, text: string): string {
    const postalCode2Re = new RegExp(this.postalCodePossibilities[city].regex[1])
    const match = text.match(postalCode2Re) && text.match(postalCode2Re)[0]
    return match ? (match.trim().length === 1 ? `7500${match.trim()}` : `750${match.trim()}`) : null
  }
}
