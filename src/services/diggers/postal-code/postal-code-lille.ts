import { PostalCodeDefault } from '@services/diggers/postal-code/encadrement-postal-code-default'

export class PostalCodeLille extends PostalCodeDefault {
  protected postalCodePossibilities = {
    hellemmes: {
      postalCodes: ['59260'],
      regex: [/\b59260\b/g],
    },
    lomme: {
      postalCodes: ['59160'],
      regex: [/\b59160\b/g],
    },
    lille: {
      postalCodes: ['59000', '59260', '59160', '59800', '59777'],
      regex: [/\b59[0-9]{3}\b/g],
    }
  }
}
