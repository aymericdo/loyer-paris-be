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
