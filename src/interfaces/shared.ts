import { IncompleteAd } from '@interfaces/ad'
import { EstEnsembleDistrictItem, EstEnsembleDistrictItemProperties } from './est-ensemble'
import { ParisDistrictItem, ParisDistrictItemProperties, ParisEncadrementItem } from './paris'
import { PlaineCommuneDistrictItem, PlaineCommuneDistrictItemProperties } from './plaine-commune'

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
  maison?: boolean;
}

export interface DefaultDistrictItemProperties {
  city: string
  codeObservatoire: string
  codeInsee: string
  zone: string
  postalCode: string
  year: string
}

export interface DefaultDistrictItem {
  type: 'Feature'
  geometry: { type: 'MultiPolygon'; coordinates: number[][][] } | { type: 'GeometryCollection', geometries: DefaultDistrictItem }
  properties: DefaultDistrictItemProperties
}

export type DistrictItemProperties =
  DefaultDistrictItemProperties
  | ParisDistrictItemProperties
  | PlaineCommuneDistrictItemProperties
  | EstEnsembleDistrictItemProperties

export type DistrictItem =
  DefaultDistrictItem
  | ParisDistrictItem
  | PlaineCommuneDistrictItem
  | EstEnsembleDistrictItem

export type EncadrementItem = DefaultEncadrementItem | ParisEncadrementItem

export interface GeojsonFile {
  type: 'FeatureCollection'
  features: DistrictItem[]
}
