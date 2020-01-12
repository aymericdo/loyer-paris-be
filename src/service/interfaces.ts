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