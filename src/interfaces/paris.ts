import {
  DISPLAY_CITY_FIELD,
  DISPLAY_ZONE_FIELD,
} from '@services/districts/districts-list'

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

export interface ParisDistrictItemProperties {
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
  [DISPLAY_CITY_FIELD]: string
}
