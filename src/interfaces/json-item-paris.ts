export interface ParisAddressItem {
  datasetid: string
  recordid: string
  fields: {
    n_sq_ad: number
    l_adr: string
    a_nvoie: number
    objectid: number
    c_suf2: string
    n_sq_vo: number
    l_nvoie: string
    b_offstdf: string
    geom_x_y: number[]
    geom: {
      type: string
      coordinates: number[]
    }
    n_sq_ar: number
    b_hors75: string
    b_angle: string
    n_voie: number
    c_ar: number
  }
  geometry: {
    type: string
    coordinates: number[]
  }
  record_timestamp: string
}

export interface ParisDistrictItem {
  type: 'Feature'
  geometry: {
    type: 'Polygon'
    coordinates: number[][][]
  }
  properties: {
    n_sq_qu: number
    perimetre: string
    geom_x_y: number[]
    c_qu: number
    surface: number
    l_qu: string
    n_sq_ar: number
    c_quinsee: number
    c_ar: number
  }
}

export interface ArrondissementItem {
  type: 'Feature'
  geometry: {
    type: 'Polygon'
    coordinates: number[][][]
  }
  properties: {
    n_sq_co: number
    n_sq_qu: number
    perimetre: string
    geom_x_y: number[]
    surface: number
    l_aroff: string
    n_sq_ar: number
    c_arinsee: number
    c_ar: number
  }
}

export interface ParisEncadrementItem {
  datasetid: string
  recordid: string
  fields: {
    ville: string
    epoque: string
    id_zone: number
    meuble_txt: string
    max: number
    min: number
    geo_point_2d: number[]
    nom_quartier: string
    geo_shape: {
      type: string
      coordinates: number[][][]
    }
    id_quartier: number
    piece: number
    ref: number
    annee: number
    code_grand_quartier: number
  }
  geometry: {
    type: string
    coordinates: number[]
  }
  record_timestamp: string
}

export interface ParisStationItem {
  type: string
  id: number
  lat: number
  lon: number
  tags: {
    'STIF:zone': string
    alt_name: string
    layer: string
    name: string
    'name:ru': string
    public_transport: string
    railway: string
    'ref:FR:RATP': string
    'ref:FR:STIF': string
    source: string
    subway: string
    'type:RATP': string
    wheelchair: string
    wikidata: string
    wikipedia: string
  }
}
