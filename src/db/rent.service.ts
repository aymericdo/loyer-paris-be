import { Rent } from './db'
import { DataBaseItem } from '@interfaces/database-item'

export async function getMapData(): Promise<{ isLegal: boolean, latitude: number, longitude: number }[]> {
    return await Rent.find({ latitude: { $exists: true }, longitude: { $exists: true } }, { isLegal: 1, latitude: 1, longitude: 1 }, (err: Error, rents: { isLegal: boolean, latitude: number, longitude: number }[]) => {
        if (err) {
            throw err
        }
        return rents
    })
}

export async function getPriceDiffData(): Promise<{ maxPrice: number, postalCode: string, priceExcludingCharges: number }[]> {
    return await Rent.find({ postalCode: { $exists: true } }, { maxPrice: 1, postalCode: 1, priceExcludingCharges: 1, isLegal: 1 }, (err: Error, rents: { maxPrice: number, postalCode: string, priceExcludingCharges: number, isLegal: number }[]) => {
        if (err) {
            throw err
        }
        return rents
    })
}

export async function getPriceVarData(): Promise<{ maxPrice: number, postalCode: string, priceExcludingCharges: number }[]> {
    return await Rent.find({ createdAt: { $exists: true } }, { createdAt: 1, maxPrice: 1, priceExcludingCharges: 1, isLegal: 1 }, (err: Error, rents: { isLegal: boolean, createdAt: string, maxPrice: number, priceExcludingCharges: number }[]) => {
        if (err) {
            throw err
        }
        return rents
    })
}

export async function getLegalPerSurfaceData(): Promise<{ isLegal: boolean, surface: number }[]> {
    return await Rent.find({ surface: { $lte: 100 } }, { isLegal: 1, surface: 1 }, (err: Error, rents: { isLegal: boolean, surface: number }[]) => {
        if (err) {
            throw err
        }
        return rents
    })
}

export async function getAdoptionData(): Promise<{ createdAt: string }[]> {
    return await Rent.find({}, { createdAt: 1 }, (err: Error, rents: { createdAt: string }[]) => {
        if (err) {
            throw err
        }
        return rents
    })
}

export async function getWelcomeData(): Promise<{ isLegal: boolean, surface: number, postalCode: string }[]> {
    return await Rent.find({}, { isLegal: 1, surface: 1, postalCode: 1 }, (err: Error, rents: { isLegal: boolean, surface: number, postalCode: string }[]) => {
        if (err) {
            throw err
        }
        return rents
    })
}

export async function getAdById(id: string, website: string): Promise<DataBaseItem> {
    return await Rent.findOne({ id, website }, (err: Error, rent: DataBaseItem) => {
        if (err) {
            throw err
        }
        return rent
    })
}
