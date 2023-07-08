import { DISPLAY_ZONE_FIELD } from '@services/districts/districts-list'

export interface LilleEncadrementItem {
  zone: number
  meuble: boolean
  nombre_de_piece: string
  annee_de_construction: string
  prix_min: string
  prix_med: string
  prix_max: string
}

export interface LilleDistrictItem {
  type: 'Feature'
  geometry: {
    type: 'Polygon'
    coordinates: number[][][]
  }
  properties: {
    zonage: number
    geo_point_2d: [number, number]
    [DISPLAY_ZONE_FIELD]: string
  }
}
