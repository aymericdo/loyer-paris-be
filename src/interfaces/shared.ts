import { IncompleteAd } from '@interfaces/ad'
import {  BordeauxEncadrementItem } from './bordeaux'
import { EstEnsembleDistrictItem, EstEnsembleDistrictItemProperties, EstEnsembleEncadrementItem } from './est-ensemble'
import { LyonEncadrementItem } from './lyon'
import { MontpellierEncadrementItem } from './montpellier'
import { ParisDistrictItem, ParisDistrictItemProperties, ParisEncadrementItem } from './paris'
import { PlaineCommuneDistrictItem, PlaineCommuneDistrictItemProperties, PlaineCommuneEncadrementItem } from './plaine-commune'
import { LilleEncadrementItem } from '@interfaces/lille'
import { PaysBasqueEncadrementItem } from '@interfaces/pays-basque'
import { GrenobleEncadrementItem } from '@interfaces/grenoble'

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
  geometry: { type: 'MultiPolygon'; coordinates: number[][][] }
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

export type EncadrementItem =
  DefaultEncadrementItem
  | ParisEncadrementItem
  | LyonEncadrementItem
  | LilleEncadrementItem
  | MontpellierEncadrementItem
  | GrenobleEncadrementItem
  | EncadrementItemWithHouse

export type EncadrementItemWithHouse =
  | EstEnsembleEncadrementItem
  | PlaineCommuneEncadrementItem
  | BordeauxEncadrementItem
  | PaysBasqueEncadrementItem

export interface GeojsonFile {
  type: 'FeatureCollection'
  features: DistrictItem[]
}
