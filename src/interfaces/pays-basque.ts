import { DefaultEncadrementItem } from '@interfaces/shared'
import { DISPLAY_ZONE_FIELD } from '@services/districts/districts-list'

export interface PaysBasqueEncadrementItem extends DefaultEncadrementItem {
  maison: boolean
}

export interface PaysBasqueDistrictItem {
  type: 'Feature'
  properties: {
    Zone: string
    [DISPLAY_ZONE_FIELD]: string
  }
  geometry: { type: 'MultiPolygon'; coordinates: number[][][] }
}