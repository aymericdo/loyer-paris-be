import { PostalCodeDefault } from '@services/diggers/postal-code/encadrement-postal-code-default'

export class PostalCodeBordeaux extends PostalCodeDefault {
  protected postalCodePossibilities = {
    bordeaux: {
      postalCodes: ['33000', '33300', '33800', '33100', '33200'],
      regex: [/\b33[0-9]{3}\b/g],
    },
  }
}
