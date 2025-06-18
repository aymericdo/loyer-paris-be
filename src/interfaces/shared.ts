import { IncompleteAd } from '@interfaces/ad'
import { EstEnsembleDistrictItemProperties } from './est-ensemble'
import { ParisDistrictItemProperties, ParisEncadrementItem } from './paris'
import { PlaineCommuneDistrictItemProperties } from './plaine-commune'
import { ObservatoireEncadrementItem } from '@interfaces/observatoire-des-loyers'
import { ZoneDocument } from '@db/zone.model'

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
  zone: number
  meuble: boolean
  nombre_de_piece: string
  annee_de_construction: string
  prix_min: string
  prix_med: string
  prix_max: string
  maison?: boolean
}

export interface DefaultDistrictItemProperties {
  city: string
  codeObservatoire: string
  codeInsee: string
  zone: string
  postalCode: string
  year: string
}

export type DistrictItemProperties =
  | DefaultDistrictItemProperties
  | ParisDistrictItemProperties
  | PlaineCommuneDistrictItemProperties
  | EstEnsembleDistrictItemProperties

export type EncadrementItem =
  | DefaultEncadrementItem
  | ParisEncadrementItem
  | ObservatoireEncadrementItem

export interface GeojsonFile {
  type: 'FeatureCollection'
  features: ZoneDocument[]
}
