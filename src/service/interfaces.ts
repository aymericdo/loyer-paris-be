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
    address: string
    cityLabel: string
    description: string
    furnished: boolean
    price: number
    renter: string
    rooms: number
    surface: number
    title: string
}