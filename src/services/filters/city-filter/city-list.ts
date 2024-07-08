const cityList = {
  paris: {
    mainCity: 'paris',
    zones: {
      1: ['Palais-Royal','Halles','St-Germain-l\'Auxerrois','Place-Vendôme'],
      2: ['Gaillon','Mail','Vivienne','Bonne-Nouvelle'],
      3: ['Enfants-Rouges','Arts-et-Metiers','Sainte-Avoie','Archives'],
      4: ['Arsenal','Saint-Gervais','Notre-Dame','Saint-Merri'],
      5: ['Saint-Victor','Val-de-Grace','Jardin-des-Plantes','Sorbonne'],
      6: ['Saint-Germain-des-Prés','Notre-Dame-des-Champs','Odeon','Monnaie'],
      7: ['Saint-Thomas-d\'Aquin','Gros-Caillou','Ecole-Militaire','Invalides'],
      8: ['Madeleine','Europe','Faubourg-du-Roule','Champs-Elysées'],
      9: ['Faubourg-Montmartre','Saint-Georges','Chaussée-d\'Antin','Rochechouart'],
      10: ['Porte-Saint-Martin','Hôpital-Saint-Louis','Saint-Vincent-de-Paul','Porte-Saint-Denis'],
      11: ['Saint-Ambroise','Roquette','Folie-Méricourt','Sainte-Marguerite'],
      12: ['Picpus','Quinze-Vingts','Bel-Air','Bercy'],
      13: ['Maison-Blanche','Salpêtrière','Gare','Croulebarbe'],
      14: ['Parc-de-Montsouris','Plaisance','Montparnasse','Petit-Montrouge'],
      15: ['Grenelle','Necker','Javel','Saint-Lambert'],
      16: ['Chaillot','Porte-Dauphine','Auteuil','Muette'],
      17: ['Epinettes','Plaine de Monceaux','Batignolles','Ternes'],
      18: ['Clignancourt','Grandes-Carrières','Goutte-d\'Or','La Chapelle'],
      19: ['Villette','Amérique','Pont-de-Flandre','Combat'],
      20: ['Charonne','Belleville','Saint-Fargeau','Père-Lachaise'],
    },
  },
  hellemmes: {
    mainCity: 'lille',
    zones: null,
  },
  lomme: {
    mainCity: 'lille',
    zones: null,
  },
  lille: {
    mainCity: 'lille',
    zones: ['Zone 1', 'Zone 2', 'Zone 3', 'Zone 4', 'Zone 5'],
  },
  aubervilliers: {
    mainCity: 'plaineCommune',
    zones: ['Zone 314'],
  },
  'epinay-sur-seine': {
    mainCity: 'plaineCommune',
    zones: ['Zone 315'],
  },
  'ile-saint-denis': {
    mainCity: 'plaineCommune',
    zones: ['Zone 312'],
  },
  courneuve: {
    mainCity: 'plaineCommune',
    zones: ['Zone 316'],
  },
  pierrefitte: {
    mainCity: 'plaineCommune',
    zones: ['Zone 317'],
  },
  'saint-denis': {
    mainCity: 'plaineCommune',
    zones: ['Zone 311', 'Zone 312'],
  },
  'saint-ouen': {
    mainCity: 'plaineCommune',
    zones: ['Zone 310'],
  },
  stains: {
    mainCity: 'plaineCommune',
    zones: ['Zone 318'],
  },
  villetaneuse: {
    mainCity: 'plaineCommune',
    zones: ['Zone 316'],
  },
  lyon: {
    mainCity: 'lyon',
    zones: ['Zone 1', 'Zone 2', 'Zone 3', 'Zone 4', 'Zone 5'],
  },
  villeurbanne: {
    mainCity: 'lyon',
    zones: null,
  },
  bagnolet: {
    mainCity: 'estEnsemble',
    zones: ['Zone 308'],
  },
  bobigny: {
    mainCity: 'estEnsemble',
    zones: ['Zone 315'],
  },
  bondy: {
    mainCity: 'estEnsemble',
    zones: ['Zone 318'],
  },
  'le pré-saint-gervais': {
    mainCity: 'estEnsemble',
    zones: ['Zone 308'],
  },
  'les lilas': {
    mainCity: 'estEnsemble',
    zones: ['Zone 307'],
  },
  montreuil: {
    mainCity: 'estEnsemble',
    zones: ['Zone 307', 'Zone 308'],
  },
  'noisy-le-sec': {
    mainCity: 'estEnsemble',
    zones: ['Zone 311'],
  },
  pantin: {
    mainCity: 'estEnsemble',
    zones: ['Zone 308'],
  },
  romainville: {
    mainCity: 'estEnsemble',
    zones: ['Zone 313'],
  },
  montpellier: {
    mainCity: 'montpellier',
    zones: ['Zone 1', 'Zone 2', 'Zone 3', 'Zone 4', 'Zone 5'],
  },
  bordeaux: {
    mainCity: 'bordeaux',
    zones: ['Zone 1', 'Zone 2', 'Zone 3', 'Zone 4'],
  },
} as const

export type AvailableCities = keyof typeof cityList
export type AvailableMainCities = typeof cityList[AvailableCities]['mainCity']
export type AvailableCityZones = typeof cityList[AvailableCities]['zones']

export const mainCityList: AvailableMainCities[] = Object.values(cityList).map((city) => city.mainCity)
export const getCityList = (mainCity: AvailableMainCities = null, city: AvailableCities = null): AvailableCities[] =>
  city ? [city] : mainCity ? getCitiesFromMainCity(mainCity) : Object.keys(cityList) as AvailableCities[]
export const getMainCity = (city: AvailableCities): AvailableMainCities => cityList[city].mainCity
export const getCitiesFromMainCity = (mainCity: AvailableMainCities): AvailableCities[] =>
  Object.keys(cityList).filter((city: AvailableCities) => cityList[city].mainCity === mainCity) as AvailableCities[]
export const getCityZones = (city: AvailableCities): AvailableCityZones => cityList[city].zones
export const getCityListObjectClone = () => ({ ...cityList })
