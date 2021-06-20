export interface PlaineCommuneDistrictItem {
  type: 'Feature'
  properties: {
    ID_BD_Topo: string
    INSEE_COM: string
    CODE_POST: string
    NOM_COM: string
    SIREN_EPCI: string
    Zone: string
  }
  geometry: { type: 'MultiPolygon'; coordinates: number[][][] }
}

export interface PlaineCommuneEncadrementItem {
  'Secteur géographique': number
  Type: 'Appartement' | 'Maison'
  'Nombre de pièces': string
  'Epoque de construction': string
  'Type de location': 'non meublé' | 'meublé'
  'Loyer de référence minoré': string
  'Loyer de référence': string
  'Loyer de référence majoré': string
}

export interface PlaineCommuneAddress {
  type: 'FeatureCollection'
  name: 'Base_Adresse_Nationale'
  crs: { type: 'name'; properties: { name: 'urn:ogc:def:crs:OGC:1.3:CRS84' } }
  features: PlaineCommuneAddressItem[]
}

export interface PlaineCommuneAddressItem {
  type: 'Feature'
  properties: {
    id: string
    id_fantoir: any
    numero: number
    rep: any
    nom_voie: string
    code_posta: number
    code_insee: number
    nom_commun: string
    code_ins_1: string
    nom_ancien: string
    x: number
    y: number
    lon: number
    lat: number
    alias: string
    nom_ld: string
    libelle_ac: string
    nom_afnor: string
    source_pos: string
    source_nom: string
  }
  geometry: {
    type: 'Point'
    coordinates: [number, number]
  }
}
