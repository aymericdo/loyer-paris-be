import { AvailableCities } from '@services/filters/city-filter/city-list'

export const postalCodes = (city: AvailableCities): { postalCodes: string[], regex: RegExp[] } => {
  switch (city) {
    case 'paris': return {
      postalCodes: [
        '75001', '75002', '75003', '75004', '75005', '75006', '75007', '75008', '75009', '75010',
        '75011', '75012', '75013', '75014', '75015', '75016', '75116', '75017', '75018', '75019', '75020',
      ],
      regex: [/\b75[0-1][0-9]{2}\b/g, /((?<=paris )[0-9]{1,2})|([0-9]{1,2} ?(?=er|ème|e|eme))/g],
    }
    case 'lyon': return {
      postalCodes: ['69001', '69002', '69003', '69004', '69005', '69006', '69007', '69008', '69009', '69100'],
      regex: [/\b690[0-9]{2}\b/g, /((?<=lyon )[0-9]{1})|([0-9]{1} ?(?=er|ème|e|eme))/g],
    }
    case 'lille': return {
      postalCodes: ['59000', '59260', '59160', '59800', '59777'],
      regex: [/\b59[0-9]{3}\b/g],
    }
    case 'hellemmes': return {
      postalCodes: ['59260'],
      regex: [/\b59260\b/g],
    }
    case 'lomme': return {
      postalCodes: ['59160'],
      regex: [/\b59160\b/g],
    }
    case 'montpellier': return {
      postalCodes: ['34000', '34070', '34080', '34090'],
      regex: [/\b34[0-9]{3}\b/g],
    }
    case 'bordeaux': return {
      postalCodes: ['33000', '33300', '33800', '33100', '33200'],
      regex: [/\b33[0-9]{3}\b/g],
    }
    case 'aubervilliers': return {
      postalCodes: ['93300'],
      regex: [/\b93300\b/g],
    }
    case 'epinay-sur-seine': return {
      postalCodes: ['93800'],
      regex: [/\b93800\b/g],
    }
    case 'ile-saint-denis': return {
      postalCodes: ['93450'],
      regex: [/\b93450\b/g],
    }
    case 'courneuve': return {
      postalCodes: ['93120'],
      regex: [/\b93120\b/g],
    }
    case 'pierrefitte': return {
      postalCodes: ['93380'],
      regex: [/\b93380\b/g],
    }
    case 'saint-denis': return {
      postalCodes: ['93200', '93210'],
      regex: [/\b(93200|93210)\b/g],
    }
    case 'saint-ouen': return {
      postalCodes: ['93400'],
      regex: [/\b93400\b/g],
    }
    case 'stains': return {
      postalCodes: ['93240'],
      regex: [/\b93240\b/g],
    }
    case 'villetaneuse': return {
      postalCodes: ['93430'],
      regex: [/\b93430\b/g],
    }
    case 'villeurbanne': return {
      postalCodes: ['69100'],
      regex: [/\b69100\b/g],
    }
    case 'bagnolet': return {
      postalCodes: ['93170'],
      regex: [/\b93170\b/g],
    }
    case 'bobigny': return {
      postalCodes: ['93000'],
      regex: [/\b93000\b/g],
    }
    case 'bondy': return {
      postalCodes: ['93140'],
      regex: [/\b93140\b/g],
    }
    case 'le pré-saint-gervais': return {
      postalCodes: ['93310'],
      regex: [/\b93310\b/g],
    }
    case 'les lilas': return {
      postalCodes: ['93260'],
      regex: [/\b93260\b/g],
    }
    case 'montreuil': return {
      postalCodes: ['93100'],
      regex: [/\b93100\b/g],
    }
    case 'noisy-le-sec': return {
      postalCodes: ['93130'],
      regex: [/\b93130\b/g],
    }
    case 'pantin': return {
      postalCodes: ['93500'],
      regex: [/\b93500\b/g],
    }
    case 'romainville': return {
      postalCodes: ['93230'],
      regex: [/\b93230\b/g],
    }
    case 'la rochelle': return {
      postalCodes: ['17000'],
      regex: [/\b17000\b/g],
    }
  }
}
