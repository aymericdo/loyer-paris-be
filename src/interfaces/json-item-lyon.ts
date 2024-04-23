import { DISPLAY_ZONE_FIELD } from '@services/districts/districts-list'

export interface LyonEncadrementItem {
  zone: number
  meuble: boolean
  nombre_de_piece: string
  annee_de_construction: string
  prix_min: string
  prix_med: string
  prix_max: string
}

export interface LyonDistrictItem {
  type: 'Feature'
  properties: {
    city: string
    postalCode: string
    Zone: string
    [DISPLAY_ZONE_FIELD]: string
  }
  geometry: { type: 'MultiPolygon'; coordinates: number[][][] }
}