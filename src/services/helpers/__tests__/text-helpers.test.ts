import { capitalizeFirstLetter } from '@services/helpers/capitalize'
import { getPriceExcludingCharges } from '@services/helpers/charges'
import * as cleanup from '@services/helpers/cleanup'
import { kebabize } from '@services/helpers/kebabize'
import { getFirstMatchResult, regexString } from '@services/helpers/regex'
import { roundNumber } from '@services/helpers/round-number'
import { stringToNumber } from '@services/helpers/string-to-number'

describe('kebabize', () => {
  it.each([
    ['freeRent', 'free-rent'],
    ['chargesIncluded', 'charges-included'],
    ['price', 'price'],
    ['HTTPServer', 'http-server'],
  ])('transforme « %s » en « %s »', (input, expected) => {
    expect(kebabize(input)).toBe(expected)
  })
})

describe('capitalizeFirstLetter', () => {
  it('met la première lettre en majuscule', () => {
    expect(capitalizeFirstLetter('paris')).toBe('Paris')
  })

  it('laisse le reste intact', () => {
    expect(capitalizeFirstLetter('saint-Denis')).toBe('Saint-Denis')
  })

  it('accepte une chaîne vide', () => {
    expect(capitalizeFirstLetter('')).toBe('')
  })
})

describe('roundNumber', () => {
  it('arrondit à deux décimales par défaut', () => {
    expect(roundNumber(12.3456)).toBe(12.35)
  })

  it('respecte le nombre de décimales demandé', () => {
    expect(roundNumber(12.3456, 1)).toBe(12.3)
  })

  it('renvoie null plutôt que zéro', () => {
    expect(roundNumber(0)).toBeNull()
    expect(roundNumber(null)).toBeNull()
  })
})

describe('getPriceExcludingCharges', () => {
  it('déduit les charges déclarées', () => {
    expect(getPriceExcludingCharges(1000, 80, false)).toBe(920)
  })

  it('estime les charges à 10 % quand elles sont tues', () => {
    expect(getPriceExcludingCharges(1000, null, true)).toBe(900)
  })

  it('refuse une charge supérieure à la moitié du loyer', () => {
    expect(getPriceExcludingCharges(1000, 800, true)).toBe(900)
  })

  it('ne déduit rien sans charges ni forfait', () => {
    expect(getPriceExcludingCharges(1000, null, false)).toBe(1000)
  })
})

describe('cleanup.string', () => {
  it('normalise casse, accents, sauts de ligne et espaces', () => {
    expect(cleanup.string('ÉTÉ\n  été   ')).toBe('ete ete')
  })

  it('renvoie la valeur telle quelle si elle est vide', () => {
    expect(cleanup.string(undefined)).toBeUndefined()
  })
})

describe('cleanup.price', () => {
  it.each([
    ['1 200 €', 1200],
    ['1200', 1200],
    ['loyer 950 euros charge comprises', 950],
    ['1,200 € / mois', 1200],
    // cas « €1,500 / Month » : le « 0 » final est rattaché au millier
    ['€1,500 / Month', 1500],
  ])('extrait le loyer de « %s »', (input, expected) => {
    expect(cleanup.price(input)).toBe(expected)
  })

  it('renvoie null quand aucun nombre n’est trouvé', () => {
    expect(cleanup.price('')).toBeNull()
    expect(cleanup.price(null)).toBeNull()
  })
})

describe('cleanup.number', () => {
  it.each([
    ['12,5 m²', 12.5],
    ['12.5', 12.5],
    ['950 €', 950],
  ])('extrait « %s »', (input, expected) => {
    expect(cleanup.number(input)).toBe(expected)
  })

  it('renvoie null quand aucun nombre n’est trouvé', () => {
    expect(cleanup.number('abc')).toBeNull()
    expect(cleanup.number('')).toBeNull()
  })
})

describe('cleanup.streetNumber', () => {
  it('extrait le numéro de voie', () => {
    expect(cleanup.streetNumber('12 rue de la Paix')).toBe(12)
  })

  it('tolère un suffixe « ter »', () => {
    expect(cleanup.streetNumber('5 ter rue de la Paix')).toBe(5)
  })

  it('renvoie NaN sur un suffixe « bis » collé', () => {
    // comportement historique : « 12bis » devient « 12b », non convertible
    expect(cleanup.streetNumber('12bis rue de la Paix')).toBeNaN()
  })

  it('renvoie null sans numéro', () => {
    expect(cleanup.streetNumber('n/a')).toBeNull()
  })
})

describe('cleanup.address', () => {
  it('retire la ville de l’adresse', () => {
    expect(cleanup.address('10 rue de la Paix paris', 'paris')).toBe(
      '10 rue de la Paix',
    )
  })

  it('développe l’abréviation de boulevard', () => {
    expect(cleanup.address('bd Victor Hugo paris', 'paris')).toBe(
      'boulevard Victor Hugo',
    )
  })

  it('écarte les adresses d’annonce déguisées', () => {
    expect(cleanup.address('rue commercante', 'paris')).toBeNull()
    expect(cleanup.address('parking inclus', 'paris')).toBeNull()
  })
})

describe('regexString', () => {
  it('renvoie la regex demandée', () => {
    expect(regexString('roomCount')).toBeInstanceOf(RegExp)
  })

  it('renvoie null pour une clé inconnue', () => {
    expect(regexString('inexistant')).toBeNull()
  })
})

describe('getFirstMatchResult', () => {
  it('extrait le nombre de pièces en toutes lettres', () => {
    const regex = regexString('roomCount')

    expect(getFirstMatchResult('un appartement de deux pieces', regex)).toBe(
      'deux',
    )
  })

  it('détecte la colocation', () => {
    const regex = regexString('colocation')

    expect(getFirstMatchResult('colocation acceptee', regex)).toBe('colocation')
  })

  it('renvoie null sans correspondance, undefined sans texte', () => {
    const regex = regexString('isHouse')

    expect(getFirstMatchResult('appartement', regex)).toBeNull()
    expect(getFirstMatchResult(null, regex)).toBeUndefined()
  })
})

describe('stringToNumber', () => {
  it.each([
    ['3', 3],
    ['0', 0],
    ['un', 1],
    ['huit', 8],
  ])('convertit « %s » en %s', (input, expected) => {
    expect(stringToNumber(input)).toBe(expected)
  })

  it('renvoie null sur une valeur vide ou hors vocabulaire', () => {
    expect(stringToNumber('')).toBeNull()
    expect(stringToNumber(null)).toBeNull()
    expect(stringToNumber('beaucoup')).toBeNull()
  })
})
