import { Coordinate } from '@interfaces/shared'
import { AvailableCities } from '@services/address/city'

export interface Ad {
  id: string
  address?: string
  charges?: number
  cityLabel?: string
  coord?: Coordinate
  description: string
  dpe?: DPE | null
  furnished?: boolean
  hasCharges?: boolean
  neighborhood?: string
  postalCode?: string
  price: number
  renter?: string
  rooms?: number
  stations?: string[]
  surface: number
  title?: string
  yearBuilt?: number
}

export interface CleanAd {
  id: string
  roomCount: number
  hasFurniture: boolean
  surface: number
  price: number
  address: string
  postalCode: string
  city: AvailableCities
  coordinates: Coordinate
  blurryCoordinates: Coordinate
  yearBuilt: number[]
  renter: string
  stations: string[]
  charges: number
  hasCharges: boolean
  isHouse?: boolean
  dpe?: DPE
}

export interface InfoToFilter {
  roomCount: number
  hasFurniture: boolean
  postalCode: string
  coordinates: Coordinate
  blurryCoordinates: Coordinate
  yearBuilt: number[]
  districtName?: string
  isHouse?: boolean
}

export interface FilteredResult {
  maxPrice: number
  minPrice: number
  districtName: string
  isFurnished: boolean
  roomCount: string
  yearBuilt: string
  isHouse?: string
}

export interface IncompleteAd {
  id: string
  website: string
  url: string
  city?: string
}

export type DPE = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G'
