import { IncompleteAd } from '@interfaces/ad'
import { DISPLAY_ZONE_FIELD } from '@services/districts/districts-list'
import {  BordeauxDistrictItem, BordeauxEncadrementItem } from './bordeaux'
import { EstEnsembleDistrictItem, EstEnsembleEncadrementItem } from './est-ensemble'
import { LyonDistrictItem, LyonEncadrementItem } from './lyon'
import { MontpellierEncadrementItem } from './montpellier'
import { ParisAddressItemDB, ParisDistrictItem, ParisEncadrementItem } from './paris'
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

export type AddressItemDB = DefaultAddressItemDB | ParisAddressItemDB

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
