import { PostalCodeDefault } from '@services/diggers/postal-code/encadrement-postal-code-default'

export class PostalCodeEstEnsemble extends PostalCodeDefault {
  protected postalCodePossibilities = {
    bagnolet: {
      postalCodes: ['93170'],
      regex: [/\b93170\b/g],
    },
    bobigny: {
      postalCodes: ['93000'],
      regex: [/\b93000\b/g],
    },
    bondy: {
      postalCodes: ['93140'],
      regex: [/\b93140\b/g],
    },
    'le pré-saint-gervais': {
      postalCodes: ['93310'],
      regex: [/\b93310\b/g],
    },
    'les lilas': {
      postalCodes: ['93260'],
      regex: [/\b93260\b/g],
    },
    montreuil: {
      postalCodes: ['93100'],
      regex: [/\b93100\b/g],
    },
    'noisy-le-sec': {
      postalCodes: ['93130'],
      regex: [/\b93130\b/g],
    },
    pantin: {
      postalCodes: ['93500'],
      regex: [/\b93500\b/g],
    },
    romainville: {
      postalCodes: ['93230'],
      regex: [/\b93230\b/g],
    },
  }
}
