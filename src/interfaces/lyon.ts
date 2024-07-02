import { DefaultEncadrementItem } from '@interfaces/shared'
import { DISPLAY_ZONE_FIELD } from '@services/districts/districts-list'

export interface LyonEncadrementItem extends DefaultEncadrementItem { }

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