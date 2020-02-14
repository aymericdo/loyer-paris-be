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