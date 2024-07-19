import { IncompleteAd } from '@interfaces/ad'
import { DISPLAY_ZONE_FIELD } from '@services/districts/districts-list'
import {  BordeauxDistrictItem, BordeauxEncadrementItem } from './bordeaux'
import { EstEnsembleDistrictItem, EstEnsembleEncadrementItem } from './est-ensemble'
import { LyonDistrictItem, LyonEncadrementItem } from './lyon'
import { MontpellierEncadrementItem } from './montpellier'
import { ParisDistrictItem, ParisEncadrementItem } from './paris'
import { PlaineCommuneDistrictItem, PlaineCommuneEncadrementItem } from './plaine-commune'
import { LilleEncadrementItem } from '@interfaces/lille'

export interface Coordinate {
  lat: number
  lng: number
}

export interface ApiError {
  error: string
  msg: string
  isIncompleteAd?: boolean
  incompleteAd?: IncompleteAd
  stack?: string
}

export interface AddressItem {
  address: string
  postalCode: string
  coordinate: Coordinate
}

export interface DefaultEncadrementItem {
  zone: number;
  meuble: boolean;
  nombre_de_piece: string;
  annee_de_construction: string;
  prix_min: string;
  prix_med: string;
  prix_max: string;
}

export interface DefaultDistrictItem {
  type: 'Feature'
  properties: {
    Zone: number
    [DISPLAY_ZONE_FIELD]: string
  }
  geometry: { type: 'MultiPolygon'; coordinates: number[][][] }
}

export type DistrictItem = DefaultDistrictItem | ParisDistrictItem | PlaineCommuneDistrictItem | EstEnsembleDistrictItem | LyonDistrictItem | BordeauxDistrictItem

export type EncadrementItem =
  | DefaultEncadrementItem
  | ParisEncadrementItem
  | EstEnsembleEncadrementItem
  | PlaineCommuneEncadrementItem
  | LyonEncadrementItem
  | LilleEncadrementItem
  | MontpellierEncadrementItem
  | BordeauxEncadrementItem
  | EncadrementItemWithHouse

export type EncadrementItemWithHouse =
  | EstEnsembleEncadrementItem
  | PlaineCommuneEncadrementItem
  | BordeauxEncadrementItem

export interface GeojsonFile {
  type: 'FeatureCollection'
  features: DistrictItem[]
}
