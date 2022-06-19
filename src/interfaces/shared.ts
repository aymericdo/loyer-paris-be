import { IncompleteAd } from '@interfaces/ad'
import { EstEnsembleEncadrementItem } from './json-item-est-ensemble'
import { LilleEncadrementItem } from './json-item-lille'
import { LyonAddressItem } from './json-item-lyon'
import { MontpellierEncadrementItem } from './json-item-montpellier'
import { ParisEncadrementItem } from './json-item-paris'
import { PlaineCommuneEncadrementItem } from './json-item-plaine-commune'

export interface Coordinate {
  lat: number;
  lng: number;
}

export interface ApiError {
  error: string;
  msg: string;
  isIncompleteAd?: boolean;
  incompleteAd?: IncompleteAd;
}

export interface AddressItem {
  address: string;
  postalCode: string;
  coordinate: Coordinate;
}

export type EncadrementItem =
  ParisEncadrementItem |
  EstEnsembleEncadrementItem |
  PlaineCommuneEncadrementItem |
  LyonAddressItem |
  LilleEncadrementItem |
  MontpellierEncadrementItem