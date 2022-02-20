import { IncompleteAd } from '@interfaces/ad'
import { LilleStationItem } from './json-item-lille'
import { ParisStationItem } from './json-item-paris'

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

export type StationItem = LilleStationItem | ParisStationItem;
