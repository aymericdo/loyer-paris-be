import { Coordinate } from '@interfaces/shared'

export interface Ad {
    id: string
    address?: string
    charges?: number
    cityLabel?: string
    coord?: Coordinate
    description: string
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
    roomCount?: number
    hasFurniture?: boolean
    surface: number
    price: number
    address: string
    postalCode: string
    city: string
    coordinates?: Coordinate
    blurryCoordinates?: Coordinate
    yearBuilt?: number[]
    renter?: string
    stations?: string[]
    charges?: number
    hasCharges?: boolean
}

export interface FilteredResult {
    maxPrice: number;
    minPrice: number;
    districtName: string;
    isFurnished: boolean;
    roomCount: number;
    yearBuilt: string;
}