import { DISPLAY_ZONE_FIELD } from '@services/districts/districts-list'

export interface ParisEncadrementItem {
  ville: string
  epoque: string
  id_zone: number
  meuble_txt: string
  max: number
  min: number
  piece: number
  ref: number
  annee: number
}

export interface ParisQuartierItem {
  id_zone: number
  nom_quartier: string
  id_quartier: number
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
    [DISPLAY_ZONE_FIELD]: string
  }
}

export interface ParisAddressItem {
  datasetid: 'adresse_paris'
  recordid: string
  record_timestamp: string
  geometry: {
    type: 'Point'
    coordinates: [number, number]
  }
  fields: {
    n_sq_ad: number
    l_adr: string
    a_nvoie: number
    objectid: number
    n_sq_vo: number
    l_nvoie: string
    b_offstdf: string
    geom_x_y: [number, number]
    geom: {
      type: 'Point'
      coordinates: [number, number]
    }
    n_sq_ar: number
    b_hors75: string
    b_angle: string
    n_voie: number
    c_ar: number
  }
}
