import { PostalCodeDefault } from '@services/diggers/postal-code/encadrement-postal-code-default'

export class PostalCodePlaineCommune extends PostalCodeDefault {
  protected postalCodePossibilities = {
    aubervilliers: {
      postalCodes: ['93300'],
      regex: [/\b93300\b/g],
    },
    'epinay-sur-seine': {
      postalCodes: ['93800'],
      regex: [/\b93800\b/g],
    },
    'ile-saint-denis': {
      postalCodes: ['93450'],
      regex: [/\b93450\b/g],
    },
    courneuve: {
      postalCodes: ['93120'],
      regex: [/\b93120\b/g],
    },
    pierrefitte: {
      postalCodes: ['93380'],
      regex: [/\b93380\b/g],
    },
    'saint-denis': {
      postalCodes: ['93200', '93210'],
      regex: [/\b(93200|93210)\b/g],
    },
    'saint-ouen': {
      postalCodes: ['93400'],
      regex: [/\b93400\b/g],
    },
    stains: {
      postalCodes: ['93240'],
      regex: [/\b93240\b/g],
    },
    villetaneuse: {
      postalCodes: ['93430'],
      regex: [/\b93430\b/g],
    },
  }
}
