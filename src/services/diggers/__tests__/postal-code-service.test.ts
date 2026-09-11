import { Ad } from '@interfaces/ad'
import { PostalCodeService } from '@services/diggers/postal-code-service'
import { closeDbConnections } from '@test-utils/website-test-harness'

const ad = (over: Partial<Ad> = {}): Ad => ({ ...over }) as Ad

afterAll(closeDbConnections)

describe('PostalCodeService.getPostalCode — court-circuits', () => {
  it('fait confiance au code fourni par l’annonce', () => {
    const service = new PostalCodeService('lille', 'lille')

    expect(service.getPostalCode(ad({ postalCode: '59000' }))).toBe('59000')
  })

  it('déduit d’office le code d’une ville qui n’en a qu’un', () => {
    const service = new PostalCodeService('brest', 'brest')

    expect(service.getPostalCode(ad({ title: 'peu importe' }))).toBe('29200')
  })
})

describe('PostalCodeService.getPostalCode — lecture du texte', () => {
  const paris = new PostalCodeService('paris', 'paris')

  it('lit le code dans le libellé de ville', () => {
    expect(paris.getPostalCode(ad({ cityLabel: 'paris 5e (75005)' }))).toBe(
      '75005',
    )
  })

  it('se rabat sur le titre quand le libellé est muet', () => {
    expect(
      paris.getPostalCode(ad({ cityLabel: 'paris', title: 'studio 75011' })),
    ).toBe('75011')
  })

  it('se rabat sur la description en dernier recours', () => {
    expect(
      paris.getPostalCode(
        ad({
          cityLabel: 'paris',
          title: 'studio',
          description: 'proche 75020',
        }),
      ),
    ).toBe('75020')
  })

  it('déduit l’arrondissement écrit en toutes lettres', () => {
    expect(paris.getPostalCode(ad({ cityLabel: 'paris 11e' }))).toBe('75011')
  })

  it('déduit l’arrondissement sur un ordinal', () => {
    expect(paris.getPostalCode(ad({ title: 'appartement 5ème étage' }))).toBe(
      '75005',
    )
  })

  it('refuse un code postal d’une autre ville', () => {
    expect(paris.getPostalCode(ad({ cityLabel: 'paris 69001' }))).toBeNull()
  })

  it('renvoie null quand rien ne ressemble à un code', () => {
    expect(paris.getPostalCode(ad({ cityLabel: 'paris' }))).toBeNull()
  })

  it('lit un code non parisien sur les deux premiers chiffres', () => {
    const lille = new PostalCodeService('lille', 'lille')

    expect(lille.getPostalCode(ad({ cityLabel: 'lille 59800' }))).toBe('59800')
  })
})

describe('PostalCodeService.getPostalCodePossibilities', () => {
  it('énumère les codes d’une ville', () => {
    expect(
      new PostalCodeService('lille', 'lille').getPostalCodePossibilities(),
    ).toEqual(['59000', '59260', '59160', '59800', '59777'])
  })

  it('agrège les codes de toutes les villes d’une métropole', () => {
    // lyon + villeurbanne : 10 codes + 1, « 69100 » compté deux fois
    const possibilities = new PostalCodeService(
      'lyon',
      'all',
    ).getPostalCodePossibilities()

    expect(possibilities).toContain('69001')
    expect(possibilities.length).toBe(11)
  })

  it('ne devine rien pour un périmètre « all »', () => {
    const service = new PostalCodeService('lille', 'all')

    expect(service.getPostalCode(ad({ cityLabel: 'lille 59000' }))).toBeNull()
  })
})
