import { PostalCodeDefault } from '@services/diggers/postal-code/encadrement-postal-code-default'

export class PostalCodeMontpellier extends PostalCodeDefault {
  protected postalCodePossibilities = {
    montpellier: {
      postalCodes: ['34000', '34070', '34080', '34090'],
      regex: [/\b34[0-9]{3}\b/g],
    },
  }
}
