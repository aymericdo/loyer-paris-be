import { PostalCodeDefault } from '@services/diggers/postal-code/encadrement-postal-code-default'
import { postalCodes } from '@services/filters/city-filter/postal-codes'

export class PostalCodeParis extends PostalCodeDefault {
  protected digForPostalCode2(text: string): string {
    if (this.city === 'all') return null

    const postalCodeRe = new RegExp(postalCodes(this.city).regex[1])
    const match = text.match(postalCodeRe) && text.match(postalCodeRe)[0].trim()
    return match ? (match.length === 1 ? `7500${match}` : `750${match}`) : null
  }
}
