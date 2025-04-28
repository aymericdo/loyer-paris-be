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
      regex: [/\b59000\b/g, /\b59260\b/g, /\b59160\b/g, /\b59800\b/g, /\b59777\b/g],
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
      regex: [/\b34000\b/g, /\b34070\b/g, /\b34080\b/g, /\b34090\b/g],
    }
    case 'bordeaux': return {
      postalCodes: ['33000', '33300', '33800', '33100', '33200'],
      regex: [/\b33000\b/g, /\b33300\b/g, /\b33800\b/g, /\b33100\b/g, /\b33200\b/g],
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
    case 'annecy': return {
      postalCodes: ['74000', '74370', '74600', '74940', '74960'],
      regex: [/\b74000\b/g, /\b74370\b/g, /\b74600\b/g, /\b74940\b/g, /\b74960\b/g],
    }
    case 'ahetze': return {
      postalCodes: ['64210'],
      regex: [/\b64210\b/g],
    }
    case 'anglet': return {
      postalCodes: ['64600'],
      regex: [/\b64600\b/g],
    }
    case 'arbonne': return {
      postalCodes: ['64210'],
      regex: [/\b64210\b/g],
    }
    case 'arcangues': return {
      postalCodes: ['64200'],
      regex: [/\b64200\b/g],
    }
    case 'ascain': return {
      postalCodes: ['64310'],
      regex: [/\b64310\b/g],
    }
    case 'bassussarry': return {
      postalCodes: ['64200'],
      regex: [/\b64200\b/g],
    }
    case 'bayonne': return {
      postalCodes: ['64100'],
      regex: [/\b64100\b/g],
    }
    case 'biarritz': return {
      postalCodes: ['64200'],
      regex: [/\b64200\b/g],
    }
    case 'bidart': return {
      postalCodes: ['64210'],
      regex: [/\b64210\b/g],
    }
    case 'biriatou': return {
      postalCodes: ['64700'],
      regex: [/\b64700\b/g],
    }
    case 'boucau': return {
      postalCodes: ['64340'],
      regex: [/\b64340\b/g],
    }
    case 'ciboure': return {
      postalCodes: ['64500'],
      regex: [/\b64500\b/g],
    }
    case 'guéthary': return {
      postalCodes: ['64210'],
      regex: [/\b64210\b/g],
    }
    case 'hendaye': return {
      postalCodes: ['64700'],
      regex: [/\b64700\b/g],
    }
    case 'jatxou': return {
      postalCodes: ['64480'],
      regex: [/\b64480\b/g],
    }
    case 'lahonce': return {
      postalCodes: ['64990'],
      regex: [/\b64990\b/g],
    }
    case 'larressore': return {
      postalCodes: ['64480'],
      regex: [/\b64480\b/g],
    }
    case 'mouguerre': return {
      postalCodes: ['64990'],
      regex: [/\b64990\b/g],
    }
    case 'saint-jean-de-luz': return {
      postalCodes: ['64500'],
      regex: [/\b64500\b/g],
    }
    case 'saint-pierre-d\'irube': return {
      postalCodes: ['64990'],
      regex: [/\b64990\b/g],
    }
    case 'urcuit': return {
      postalCodes: ['64990'],
      regex: [/\b64990\b/g],
    }
    case 'urrugne': return {
      postalCodes: ['64122', '64700'],
      regex: [/\b64122\b/g, /\b64700\b/g],
    }
    case 'ustaritz': return {
      postalCodes: ['64480'],
      regex: [/\b64480\b/g],
    }
    case 'villefranque': return {
      postalCodes: ['64990'],
      regex: [/\b64990\b/g],
    }

    case 'bresson': return {
      postalCodes: ['38320'],
      regex: [/\b38320\b/g],
    }
    case 'claix': return {
      postalCodes: ['38640'],
      regex: [/\b38640\b/g],
    }
    case 'domène': return {
      postalCodes: ['38420'],
      regex: [/\b38420\b/g],
    }
    case 'échirolles': return {
      postalCodes: ['38130'],
      regex: [/\b38130\b/g],
    }
    case 'éybens': return {
      postalCodes: ['38320'],
      regex: [/\b38320\b/g],
    }
    case 'fontaine': return {
      postalCodes: ['38600'],
      regex: [/\b38600\b/g],
    }
    case 'fontanil-cornillon': return {
      postalCodes: ['38120'],
      regex: [/\b38120\b/g],
    }
    case 'gières': return {
      postalCodes: ['38610'],
      regex: [/\b38610\b/g],
    }
    case 'grenoble': return {
      postalCodes: ['38000', '38100'],
      regex: [/\b38000\b/g, /,\b38100\b/g]
    }
    case 'la tronche': return {
      postalCodes: ['38700'],
      regex: [/\b38700\b/g],
    }
    case 'le pont-de-claix': return {
      postalCodes: ['38800'],
      regex: [/\b38800\b/g],
    }
    case 'meylan': return {
      postalCodes: ['38240'],
      regex: [/\b38240\b/g],
    }
    case 'murianette': return {
      postalCodes: ['38870'],
      regex: [/\b38870\b/g],
    }
    case 'poisat': return {
      postalCodes: ['38320'],
      regex: [/\b38320\b/g],
    }
    case 'saint-égrève': return {
      postalCodes: ['38120'],
      regex: [/\b38120\b/g],
    }
    case 'saint-martin-d\'hères': return {
      postalCodes: ['38400'],
      regex: [/\b38400\b/g],
    }
    case 'sassenage': return {
      postalCodes: ['38360'],
      regex: [/\b38360\b/g],
    }
    case 'seyssinet-pariset': return {
      postalCodes: ['38170'],
      regex: [/\b38170\b/g],
    }
    case 'seyssins': return {
      postalCodes: ['38185'],
      regex: [/\b38185\b/g],
    }
    case 'varces-allières-et-risset': return {
      postalCodes: ['38760'],
      regex: [/\b38760\b/g],
    }
    case 'venon': return {
      postalCodes: ['38750'],
      regex: [/\b38750\b/g],
    }
    case 'marseille': return {
      postalCodes: ['13001', '13002', '13003', '13004', '13005', '13006', '13007', '13008', '13009', '13010', '13011', '13012', '13013', '13014', '13015', '13016', '13000'],
      regex: [/\b13001\b/g, /\b13002\b/g, /\b13003\b/g, /\b13004\b/g, /\b13005\b/g, /\b13006\b/g, /\b13007\b/g, /\b13008\b/g, /\b13009\b/g, /\b13010\b/g, /\b13011\b/g, /\b13012\b/g, /\b13013\b/g, /\b13014\b/g, /\b13015\b/g, /\b13016\b/g, /\b13000\b/g],
    }
    case 'nice': return {
      postalCodes: ['06000', '06100', '06200', '06300'],
      regex: [/\b06000\b/g, /\b06100\b/g, /\b06200\b/g, /\b06300\b/g],
    }
    case 'nantes': return {
      postalCodes: ['44000', '44100', '44200', '44300'],
      regex: [/\b44000\b/g, /\b44100\b/g, /\b44200\b/g, /\b44300\b/g],
    }
    case 'strasbourg': return {
      postalCodes: ['67000', '67100', '67200'],
      regex: [/\b67000\b/g, /\b67100\b/g, /\b67200\b/g],
    }
    case 'rennes': return {
      postalCodes: ['35000', '35200', '35700'],
      regex: [/\b35000\b/g, /\b35200\b/g, /\b35700\b/g],
    }
    case 'toulon': return {
      postalCodes: ['83000', '83100', '83200'],
      regex: [/\b83000\b/g, /\b83100\b/g, /\b83200\b/g],
    }
    case 'aix-en-provence': return {
      postalCodes: ['13080', '13090', '13100', '13290', '13540'],
      regex: [/\b13080\b/g, /\b13090\b/g, /\b13100\b/g, /\b13290\b/g, /\b13540\b/g],
    }
    case 'toulouse': return {
      postalCodes: ['31000', '31004', '31090', '31100', '31200', '31300', '31400', '31500'],
      regex: [/\b31000\b/g, /\b31004\b/g, /\b31090\b/g, /\b31100\b/g, /\b31200\b/g, /\b31300\b/g, /\b31400\b/g, /\b31500\b/g],
    }
  }
}
