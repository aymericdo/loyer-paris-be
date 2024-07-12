import { DefaultDistrictItem } from '@interfaces/shared'
import { DISPLAY_ZONE_FIELD } from '@services/districts/districts-list'

export interface EstEnsembleEncadrementItem extends DefaultDistrictItem {
  maison: boolean
}

export interface EstEnsembleDistrictItem {
  type: 'Feature'
  properties: {
    com_code: string
    com_name: string
    Zone: string
    [DISPLAY_ZONE_FIELD]: string
  }
  geometry: { type: 'MultiPolygon'; coordinates: number[][][] }
}