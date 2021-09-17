import { LilleStationItem } from './json-item-lille'
import { ParisStationItem } from './json-item-paris'

export interface Coordinate {
  lat: number
  lng: number
}

export interface ApiError {
  error: string
  msg: string
}

export interface AddressItem {
  address: string
  postalCode: string
  coordinate: Coordinate
}

export interface AddressSearchResult {
  item: AddressItem
  score: number
  streetNumber: string
}
;[]

export type StationItem = ParisStationItem | LilleStationItem
