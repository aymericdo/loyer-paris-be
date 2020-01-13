export interface AddressInfo {
    postalCode: string;
    city?: string;
}
export interface Coordinate {
    lat: string;
    lng: string;
}

export interface Ad {
    id: number
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

export interface DetectedInfo {
    coordinates: Coordinate
    hasFurniture: boolean
    postalCode: string
    roomCount: number
    stations: string[]
    yearBuilt: number[]
}

export interface EncadrementItem {
    fields: {
        epoque: string
        max: string
        min: string
        meuble_txt: string
        nom_quartier: string
        piece: string
    }
}

export interface SavedInfo {
    id: number
    address: string
    city: string
    hasFurniture: boolean
    isLegal: boolean
    latitude: string
    longitude: string
    maxPrice: number
    postalCode: string
    price: number
    priceExcludingCharges: number
    renter: string
    roomCount: number
    stations: string[]
    surface: number
    website: string
    yearBuilt: number[]
}

export interface SerializedInfo {
    address: string
    charges: number
    hasCharges: boolean
    hasFurniture: boolean
    isLegal: boolean
    maxAuthorized: number
    postalCode: string
    price: number
    priceExcludingCharges: number
    roomCount: number
    surface: number
    yearBuilt: number[]
}