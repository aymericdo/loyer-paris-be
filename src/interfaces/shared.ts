import { IncompleteAd } from '@interfaces/ad'

export interface Coordinate {
  lat: number
  lng: number
}

export interface ApiError {
  error: string
  msg: string
  incompleteAd?: IncompleteAd
}

export interface AddressItem {
  address: string
  postalCode: string
  coordinate: Coordinate
}
