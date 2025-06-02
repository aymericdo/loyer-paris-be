import { DefaultEncadrementItem } from '@interfaces/shared'
import { DISPLAY_ZONE_FIELD } from '@services/districts/districts-list'

export interface EstEnsembleEncadrementItem extends DefaultEncadrementItem {
  maison: boolean
}

export interface EstEnsembleDistrictItemProperties {
  ID_BD_Topo: string
  INSEE_COM: string
  CODE_POST: string
  NOM_COM: string
  SIREN_EPCI: string
  Zone: string
  [DISPLAY_ZONE_FIELD]: string
}

export interface EstEnsembleDistrictItem {
  type: 'Feature'
  properties: EstEnsembleDistrictItemProperties
  geometry: { type: 'MultiPolygon'; coordinates: number[][][] }
}