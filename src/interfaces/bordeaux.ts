import { DefaultDistrictItem } from '@interfaces/shared'
import { DISPLAY_ZONE_FIELD } from '@services/districts/districts-list'

export interface BordeauxEncadrementItem extends DefaultDistrictItem {
  maison: boolean;
}

export interface BordeauxDistrictItem {
  type: 'Feature'
  properties: {
    com_code: number
    commune: string
    Zone: string
    [DISPLAY_ZONE_FIELD]: string
  }
  geometry: {
    type: 'Polygon'
    coordinates: number[][][]
  }
}
