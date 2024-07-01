import { IncompleteAd } from '@interfaces/ad'
import { DISPLAY_ZONE_FIELD } from '@services/districts/districts-list'
import { BordeauxDistrictItem, BordeauxEncadrementItem } from './json-item-bordeaux'
import { EstEnsembleEncadrementItem } from './json-item-est-ensemble'
import { LilleEncadrementItem } from './json-item-lille'
import { LyonDistrictItem, LyonEncadrementItem } from './json-item-lyon'
import { MontpellierEncadrementItem } from './json-item-montpellier'
import { ParisAddressItemDB, ParisDistrictItem, ParisEncadrementItem } from './json-item-paris'
import { PlaineCommuneDistrictItem, PlaineCommuneEncadrementItem } from './json-item-plaine-commune'

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

interface DefaultAddressItem {
  id: string
  numero: string
  rep: string
  nom_voie: string
  code_postal: string
  code_insee: string
  nom_commune: string
  code_insee_ancienne_commune: string
  nom_ancienne_commune: string
  x: string
  y: string
  lon: string
  lat: string
  libelle_acheminement: string
  nom_afnor: string
  source_position: string
  source_nom_voie: string
  geometry: {
    type: 'Point'
    coordinates: [number, number]
  }
}

export interface DefaultAddressItemDB extends DefaultAddressItem {
  score: number;
  districtName: string | null;
  fields: {
    l_adr: string
  }
}

export interface DefaultDistrictItem {
  type: 'Feature'
  properties: {
    Zone: number
    [DISPLAY_ZONE_FIELD]: string
  }
  geometry: { type: 'MultiPolygon'; coordinates: number[][][] }
}

export type AddressItemDB = DefaultAddressItemDB | ParisAddressItemDB

export type DistrictItem = DefaultDistrictItem | ParisDistrictItem | BordeauxDistrictItem | PlaineCommuneDistrictItem | LyonDistrictItem

export type EncadrementItem =
  | ParisEncadrementItem
  | EstEnsembleEncadrementItem
  | PlaineCommuneEncadrementItem
  | LyonEncadrementItem
  | LilleEncadrementItem
  | MontpellierEncadrementItem
  | BordeauxEncadrementItem

export interface GeojsonFile {
  type: 'FeatureCollection'
  features: DistrictItem[]
}
