import { Coordinate } from '@interfaces/shared'

export interface FacebookMapping {
    id: number
    address: string
    cityLabel: string
    description: string
    furnished: boolean
    price: string
    renter: string
    rooms: string
    surface: string
    title: string
}

export interface LeboncoinMapping {
    id: number
    cityLabel: string
    body: string
    furnished: string
    hasCharges: string
    price: string
    renter: string
    rooms: string
    surface: string
    subject: string
}

export interface LeboncoinAPIMapping {
    id: number
    list_id: number
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
    id: number
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
    id: number
    charges: string
    cityLabel: string
    description: string
    furnished: string
    hasCharges: boolean
    price: string
    renter: string
    rooms: string
    surface: string
    title: string
}

export interface LoueragileMapping {
    yearBuilt: number
    ad: {
        id: number
        city: string
        lng: number
        lat: number
        description: string
        furnished: boolean
        postal_code: string
        rent: number
        owner_type: string
        source: string
        room: number
        area: number
        title: string
        stops: {
            name: string
        }[]
    }
}

export interface OrpiMapping {
    id: number
    charges: string
    cityLabel: string
    coord: Coordinate
    description: string
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
    id: number
    cityLabel: string
    description: string
    price: string
    postalCode: string
    renter: string
    rooms: string
    surface: string
    title: string
    stations: string[]
}

export interface SelogerMapping {
    id: number
    charges: string
    cityLabel: string
    description: string
    furnished: boolean
    hasCharges: boolean
    price: string
    postalCode: string
    renter: string
    rooms: string
    surface: string
    title: string
}