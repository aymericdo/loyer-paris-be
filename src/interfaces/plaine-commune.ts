import { DefaultEncadrementItem } from '@interfaces/shared'
import { DISPLAY_ZONE_FIELD } from '@services/districts/districts-list'

export interface PlaineCommuneEncadrementItem extends DefaultEncadrementItem {
  maison: boolean
}

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
