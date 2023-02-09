import { Coordinate } from '@interfaces/shared'

export interface Body {
  noMoreData?: boolean
  platform: string
  id: string
  url: string
  data: string
}

export interface FacebookMapping {
  id: string
  cityLabel: string
  address: string
  description: string
  furnished: boolean
  price: string
  renter: string
  rooms: string
  surface: string
  title: string
}

export interface LeboncoinMapping {
  id: string
  cityLabel: string
  dpe: string | null
  body: string
  furnished: string
  hasCharges: boolean
  price: string
  renter: string
  rooms: string
  surface: string
  subject: string
}

export interface LeboncoinAPIMapping {
  id: string
  list_id: string
  subject: string
  body: string
  price: string[]
  attributes: { [detail: string]: string }[]
  location: {
    lng: string
    lat: string
    city: string
    zipcode: string
  }
}

export interface LefigaroMapping {
  id: string
  charges: string
  cityLabel: string
  description: string
  furnished: boolean
  hasCharges: boolean
  price: string
  renter: string
  rooms: string
  surface: string
  title: string
}

export interface LogicimmoMapping {
  id: string
  charges: string
  cityLabel: string
  description: string
  furnished: boolean
  price: string
  renter: string
  rooms: string
  surface: string
}

export interface OrpiMapping {
  id: string
  charges: string
  cityLabel: string
  coord: Coordinate
  description: string
  dpe: string | null
  furnished: boolean
  hasCharges: boolean
  price: number
  postalCode: string
  renter: string
  rooms: number
  surface: number
  title: string
  yearBuilt: number
}

export interface PapMapping {
  id: string
  cityLabel: string
  description: string
  dpe: string | null
  price: string
  rooms: string
  surface: string
  title: string
  stations: string[]
}

export interface SelogerMapping {
  id: string
  charges: string
  cityLabel: string
  description: string
  dpe: string | null
  furnished: boolean
  hasCharges: boolean
  price: string
  renter: string
  rooms: string
  surface: string
  title: string
  yearBuilt: string
}

export interface GensdeconfianceMapping {
  id: string
  charges: string
  cityLabel: string
  description: string
  hasCharges: boolean
  price: string
  address: string
  surface: string
  title: string
}

export interface LuxResidenceMapping {
  id: string
  cityLabel: string
  description: string
  furnished: boolean
  rooms: string
  price: string
  renter: string
  surface: string
}

export interface BellesDemeuresMapping {
  id: string
  title: string
  cityLabel: string
  description: string
  furnished: boolean
  hasCharges: boolean
  price: string
  rooms: string
  renter: string
  surface: string
}

export interface BienIciMapping {
  id: string
  title: string
  cityLabel: string
  description: string
  dpe: string | null
  furnished: boolean
  hasCharges: boolean
  charges: string
  price: string
  rooms: string
  renter: string
  surface: string
}

export interface FnaimMapping {
  id: string
  title: string
  cityLabel: string
  description: string
  hasCharges: boolean
  charges: string
  price: string
  rooms: string
  yearBuilt: string
  renter: string
  surface: string
}

export interface SuperimmoMapping {
  id: string
  title: string
  cityLabel: string
  description: string
  hasCharges: boolean
  charges: string
  price: string
  rooms: string
  yearBuilt: string
  renter: string
  surface: string
}

export interface LocserviceMapping {
  id: string
  title: string
  cityLabel: string
  description: string
  hasCharges: boolean
  furnished: boolean
  price: string
  rooms: string
  surface: string
}
