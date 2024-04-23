import { DISPLAY_ZONE_FIELD } from '@services/districts/districts-list'

export interface PlaineCommuneDistrictItem {
  type: 'Feature'
  properties: {
    ID_BD_Topo: string
    INSEE_COM: string
    CODE_POST: string
    NOM_COM: string
    SIREN_EPCI: string
    Zone: string
    [DISPLAY_ZONE_FIELD]: string
  }
  geometry: { type: 'MultiPolygon'; coordinates: number[][][] }
}

export interface PlaineCommuneEncadrementItem {
  zone: number
  maison: boolean
  meuble: boolean
  nombre_de_piece: string
  annee_de_construction: string
  prix_min: string
  prix_med: string
  prix_max: string
}
