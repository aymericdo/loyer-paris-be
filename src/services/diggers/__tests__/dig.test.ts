import { Ad } from '@interfaces/ad'
import { ERROR_CODE } from '@services/api/errors'
import { AddressService } from '@services/diggers/address-service'
import { DigService } from '@services/diggers/dig'
import { PostalCodeService } from '@services/diggers/postal-code-service'
import { YearBuiltService } from '@services/helpers/year-built'
import { closeDbConnections } from '@test-utils/website-test-harness'

const ad = (over: Partial<Ad> = {}): Ad => ({
  id: '234523',
  title: 'Appartement 3 pieces',
  description: 'Bel appartement',
  price: 1200,
  surface: 60,
  ...over,
})

/**
 * Les deux seules dépendances extérieures de digInAd : l'adresse (réseau
 * data.geopf.fr) et le bâti parisien (Mongo). Le reste est du calcul pur sur
 * l'annonce — c'est ce calcul que ces tests verrouillent.
 */
const withAddress = (
  address: string | null = '16 rue de la roquette',
  coordinates = { lng: 2.37, lat: 48.85 },
  postalCode: string | null = '75011',
) => {
  jest
    .spyOn(PostalCodeService.prototype, 'getPostalCode')
    .mockReturnValue(postalCode)
  jest
    .spyOn(AddressService.prototype, 'getAddress')
    .mockResolvedValue([address, coordinates, null])
}

afterAll(closeDbConnections)
afterEach(() => jest.restoreAllMocks())

/**
 * getEmpriseBatieBuilding est typé comme renvoyant un document Mongoose
 * complet : le double passe donc par un cast, comme ailleurs dans ce dépôt.
 */
const withBuilding = (properties: object | null) =>
  jest
    .spyOn(YearBuiltService, 'getEmpriseBatieBuilding')
    .mockResolvedValue((properties === null ? null : { properties }) as never)

describe('DigService.digInAd — assemblage', () => {
  it('reprend les champs de l’annonce et complète les siens', async () => {
    withAddress()

    const clean = await new DigService(
      ad({
        rooms: 3,
        furnished: true,
        charges: 50,
        hasCharges: true,
        dpe: 'd',
        rentComplement: 30,
        renter: 'agence',
        yearBuilt: 1975,
        stations: ['Metro'],
      }),
    ).digInAd('paris')

    expect(clean).toEqual({
      id: '234523',
      roomCount: 3,
      hasFurniture: true,
      surface: 60,
      price: 1200,
      address: '16 rue de la roquette',
      postalCode: '75011',
      city: 'paris',
      coordinates: { lng: 2.37, lat: 48.85 },
      blurryCoordinates: null,
      yearBuilt: [1975],
      renter: 'agence',
      stations: ['Metro'],
      charges: 50,
      hasCharges: true,
      isHouse: null,
      dpe: 'D',
      rentComplement: 30,
      colocation: null,
    })
  })
})

describe('DigService.digInAd — localisation', () => {
  it('refuse une annonce sans aucune localisation', async () => {
    withAddress(null, null, null)

    await expect(new DigService(ad()).digInAd('paris')).rejects.toMatchObject({
      error: ERROR_CODE.Address,
      msg: 'address not found',
      isIncompleteAd: true,
    })
  })

  it('accepte une annonce réduite à son code postal', async () => {
    withAddress(null, null, '75011')

    await expect(new DigService(ad()).digInAd('paris')).resolves.toMatchObject({
      address: null,
      postalCode: '75011',
      coordinates: null,
    })
  })
})

describe('DigService.digInAd — nombre de pièces', () => {
  beforeEach(() => withAddress())

  it('retient le nombre annoncé par le site', async () => {
    const clean = await new DigService(ad({ rooms: 4 })).digInAd('paris')

    expect(clean.roomCount).toBe(4)
  })

  it('déduit les pièces du titre', async () => {
    const clean = await new DigService(
      ad({ title: 'Appartement 5 pieces' }),
    ).digInAd('paris')

    expect(clean.roomCount).toBe(5)
  })

  it('déduit les pièces de la description en dernier recours', async () => {
    const clean = await new DigService(
      ad({ title: 'Appartement', description: '2 pieces lumineux' }),
    ).digInAd('paris')

    expect(clean.roomCount).toBe(2)
  })

  it('reste sans réponse quand l’annonce n’en parle pas', async () => {
    const clean = await new DigService(
      ad({ title: 'Appartement', description: 'lumineux' }),
    ).digInAd('paris')

    expect(clean.roomCount).toBeNull()
  })
})

describe('DigService.digInAd — surface', () => {
  beforeEach(() => withAddress())

  it('déduit la surface du titre', async () => {
    const clean = await new DigService(
      ad({ surface: undefined, title: 'Studio 24 m2' }),
    ).digInAd('paris')

    expect(clean.surface).toBe(24)
  })

  it('déduit la surface de la description', async () => {
    const clean = await new DigService(
      ad({ surface: undefined, title: 'Studio', description: '36 m2 calme' }),
    ).digInAd('paris')

    expect(clean.surface).toBe(36)
  })

  it('refuse une annonce sans surface', async () => {
    await expect(
      new DigService(ad({ surface: undefined, title: 'Studio' })).digInAd(
        'paris',
      ),
    ).rejects.toMatchObject({
      error: ERROR_CODE.Surface,
      msg: 'surface not found',
      isIncompleteAd: true,
    })
  })

  it('refuse une surface inférieure à 9 m2', async () => {
    await expect(
      new DigService(ad({ surface: 8 })).digInAd('paris'),
    ).rejects.toMatchObject({
      error: ERROR_CODE.Surface,
      msg: 'surface too small',
      isIncompleteAd: true,
    })
  })
})

describe('DigService.digInAd — prix', () => {
  beforeEach(() => withAddress())

  it('refuse une annonce sans prix', async () => {
    await expect(
      new DigService(ad({ price: undefined })).digInAd('paris'),
    ).rejects.toMatchObject({
      error: ERROR_CODE.Price,
      msg: 'price not found',
      isIncompleteAd: true,
    })
  })

  it('refuse un prix de vente déguisé', async () => {
    await expect(
      new DigService(ad({ price: 450000 })).digInAd('paris'),
    ).rejects.toMatchObject({
      error: ERROR_CODE.Price,
      msg: 'price too expensive to be a rent',
    })
  })

  it('refuse un prix trop bas pour être un loyer', async () => {
    await expect(
      new DigService(ad({ price: 40 })).digInAd('paris'),
    ).rejects.toMatchObject({
      error: ERROR_CODE.Price,
      msg: 'price too cheap to be a rent',
    })
  })
})

describe('DigService.digInAd — seuils de prix', () => {
  beforeEach(() => withAddress())

  it.each([100, 30000])('accepte un loyer de %s', async (price) => {
    withBuilding(null)

    await expect(
      new DigService(ad({ price })).digInAd('paris'),
    ).resolves.toMatchObject({ price })
  })

  it.each([
    [99, 'price too cheap to be a rent'],
    [30001, 'price too expensive to be a rent'],
  ])('refuse un loyer de %s', async (price, msg) => {
    await expect(
      new DigService(ad({ price })).digInAd('paris'),
    ).rejects.toMatchObject({ error: ERROR_CODE.Price, msg })
  })
})

describe('DigService.digInAd — meublé', () => {
  beforeEach(() => withAddress())

  it('fait confiance au booléen du site', async () => {
    const clean = await new DigService(
      ad({ furnished: false, title: 'Appartement meuble' }),
    ).digInAd('paris')

    expect(clean.hasFurniture).toBe(false)
  })

  it('déduit le meublé du texte non accentué', async () => {
    const clean = await new DigService(
      ad({ title: 'Appartement meuble' }),
    ).digInAd('paris')

    expect(clean.hasFurniture).toBe(true)
  })

  it('déduit le non-meublé du texte non accentué', async () => {
    const clean = await new DigService(
      ad({ title: 'Appartement non meuble' }),
    ).digInAd('paris')

    expect(clean.hasFurniture).toBe(false)
  })

  it('reste sans réponse quand rien ne l’indique', async () => {
    const clean = await new DigService(ad()).digInAd('paris')

    expect(clean.hasFurniture).toBeNull()
  })

  it('se passe d’un titre et d’une description', async () => {
    const clean = await new DigService(
      ad({ title: undefined, description: undefined }),
    ).digInAd('paris')

    expect(clean.hasFurniture).toBeNull()
  })

  it('déduit le meublé de la description', async () => {
    const clean = await new DigService(
      ad({ title: 'Appartement', description: 'loue meuble lumineux' }),
    ).digInAd('paris')

    expect(clean.hasFurniture).toBe(true)
  })

  it('déduit le non-meublé de la description', async () => {
    const clean = await new DigService(
      ad({ title: 'Appartement', description: 'loue non meuble' }),
    ).digInAd('paris')

    expect(clean.hasFurniture).toBe(false)
  })

  // CONSTAT D'AUDIT — les descriptions et titres arrivent bruts du scraping
  // (textContent, jamais passés par cleanup.string) et le motif /meuble/ n'a ni
  // le drapeau « i » ni de tolérance aux accents. L'orthographe courante
  // « meublé » n'est donc jamais détectée. Ces tests figent le trou : les
  // inverser sera le premier geste de la correction.
  it.each(['Appartement meublé', 'appartement MEUBLE', 'meublée', 'MEUBLÉ'])(
    '[constat] ne détecte pas « %s »',
    async (title) => {
      const clean = await new DigService(ad({ title })).digInAd('paris')

      expect(clean.hasFurniture).toBeNull()
    },
  )
})

describe('DigService.digInAd — charges', () => {
  beforeEach(() => withAddress())

  it('retient les charges annoncées', async () => {
    const clean = await new DigService(ad({ charges: 80 })).digInAd('paris')

    expect(clean.charges).toBe(80)
  })

  it('déduit les charges de la description', async () => {
    const clean = await new DigService(
      ad({ description: 'charges 90 euros par mois' }),
    ).digInAd('paris')

    expect(clean.charges).toBe(90)
  })

  it('compte zéro charge quand rien n’est dit', async () => {
    const clean = await new DigService(ad()).digInAd('paris')

    expect(clean.charges).toBe(0)
  })

  it('repère un loyer charges comprises', async () => {
    const clean = await new DigService(
      ad({ description: 'prix charges comprises' }),
    ).digInAd('paris')

    expect(clean.hasCharges).toBe(true)
  })
})

describe('DigService.digInAd — DPE', () => {
  beforeEach(() => withAddress())

  it('extrait la classe du libellé du site', async () => {
    const clean = await new DigService(ad({ dpe: 'Classe D (dpe)' })).digInAd(
      'paris',
    )

    expect(clean.dpe).toBe('D')
  })

  it('ignore un libellé sans classe connue', async () => {
    const clean = await new DigService(ad({ dpe: 'inconnu' })).digInAd('paris')

    expect(clean.dpe).toBeNull()
  })

  it('reste sans DPE quand le site n’en donne pas', async () => {
    const clean = await new DigService(ad()).digInAd('paris')

    expect(clean.dpe).toBeNull()
  })
})

describe('DigService.digInAd — année de construction', () => {
  beforeEach(() => withAddress())

  it('retient l’année annoncée', async () => {
    const clean = await new DigService(ad({ yearBuilt: 1998 })).digInAd('paris')

    expect(clean.yearBuilt).toEqual([1998])
  })

  it('se rabat sur le bâti parisien quand l’année manque', async () => {
    withBuilding({ an_const: '1975' })

    const clean = await new DigService(ad()).digInAd('paris')

    expect(clean.yearBuilt).toEqual([1975])
  })

  it('lit une période de construction du bâti', async () => {
    withBuilding({ c_perconst: 'avant 1946' })

    const clean = await new DigService(ad()).digInAd('paris')

    expect(clean.yearBuilt).toEqual([null, 1946])
  })

  it('ignore une année illisible et retombe sur le bâti', async () => {
    withBuilding({ an_const: '1975' })

    const clean = await new DigService(ad({ yearBuilt: NaN })).digInAd('paris')

    expect(clean.yearBuilt).toEqual([1975])
  })

  it('ne consulte pas le bâti hors de Paris', async () => {
    const spy = jest.spyOn(YearBuiltService, 'getEmpriseBatieBuilding')

    const clean = await new DigService(ad()).digInAd('lyon')

    expect(clean.yearBuilt).toBeNull()
    expect(spy).not.toHaveBeenCalled()
  })

  it('reste sans année si le bâti est introuvable', async () => {
    withBuilding(null)

    const clean = await new DigService(ad()).digInAd('paris')

    expect(clean.yearBuilt).toBeNull()
  })
})

describe('DigService.digInAd — locataire', () => {
  beforeEach(() => withAddress())

  it('conserve le nom de l’agence, normalisé', async () => {
    const clean = await new DigService(ad({ renter: 'Century 21' })).digInAd(
      'paris',
    )

    expect(clean.renter).toBe('century 21')
  })

  it('oublie la plateforme qui héberge l’annonce', async () => {
    const clean = await new DigService(ad({ renter: 'seloger' })).digInAd(
      'paris',
    )

    expect(clean.renter).toBeUndefined()
  })

  it('normalise un bailleur particulier', async () => {
    const clean = await new DigService(
      ad({ renter: 'M. Dupont, particulier' }),
    ).digInAd('paris')

    expect(clean.renter).toBe('Particulier')
  })
})

describe('DigService.digInAd — complément de loyer et colocation', () => {
  beforeEach(() => withAddress())

  it('retient le complément de loyer annoncé', async () => {
    const clean = await new DigService(ad({ rentComplement: 45 })).digInAd(
      'paris',
    )

    expect(clean.rentComplement).toBe(45)
  })

  it('déduit le complément de loyer de la description', async () => {
    const clean = await new DigService(
      ad({ description: 'complement de loyer 45 euros' }),
    ).digInAd('paris')

    expect(clean.rentComplement).toBe(45)
  })

  it('repère une colocation dans la description', async () => {
    const clean = await new DigService(
      ad({ description: 'colocation possible' }),
    ).digInAd('paris')

    expect(clean.colocation).toBe(true)
  })

  it('reste neutre sans mention de colocation', async () => {
    const clean = await new DigService(ad()).digInAd('paris')

    expect(clean.colocation).toBeNull()
  })
})

describe('DigService.digInAd — maison', () => {
  beforeEach(() => withAddress())

  it('suit l’annonce quand elle se déclare maison', async () => {
    const clean = await new DigService(ad({ isHouse: true })).digInAd(
      'bordeaux',
    )

    expect(clean.isHouse).toBe(true)
  })

  it('déduit la maison du titre', async () => {
    const clean = await new DigService(
      ad({ title: 'Maison 5 pieces' }),
    ).digInAd('bordeaux')

    expect(clean.isHouse).toBe(true)
  })

  it('reste neutre sans indice', async () => {
    const clean = await new DigService(ad()).digInAd('bordeaux')

    expect(clean.isHouse).toBe(false)
  })

  it('ne cherche jamais de maison à Paris', async () => {
    const clean = await new DigService(ad({ isHouse: true })).digInAd('paris')

    expect(clean.isHouse).toBeNull()
  })
})
