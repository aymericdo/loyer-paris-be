import { Rent } from '@db/db'
import * as log from '@helpers/log'
import { getAdById } from '@db/rent.service'

interface SavedInfo {
    id: string
    address: string
    city: string
    hasFurniture?: boolean
    isLegal: boolean
    latitude?: number
    longitude?: number
    maxPrice: number
    postalCode: string
    price: number
    priceExcludingCharges: number
    renter?: string
    roomCount?: number
    stations?: string[]
    surface: number
    website: string
    yearBuilt?: number[]
}

export class SaveRentService {
    adToSave: SavedInfo = null

    constructor(adToSave: SavedInfo) {
        this.adToSave = adToSave
    }

    async save(): Promise<void> {
        if (this.adToSave.id) {
            const findSimilarAd = await getAdById(this.adToSave.id, this.adToSave.website)
            if (findSimilarAd && findSimilarAd.priceExcludingCharges !== this.adToSave.priceExcludingCharges) {
                log.priceHasChanged()
            }
    
            const rent = new Rent({
                id: this.adToSave.id,
                website: this.adToSave.website,
                address: this.adToSave.address,
                isLegal: this.adToSave.isLegal,
                maxPrice: this.adToSave.maxPrice,
                postalCode: this.adToSave.postalCode,
                price: this.adToSave.price,
                priceExcludingCharges: this.adToSave.priceExcludingCharges,
                surface: this.adToSave.surface,
                city: this.adToSave.city,
                ...(this.adToSave.hasFurniture != null && { hasFurniture: this.adToSave.hasFurniture }),
                ...(this.adToSave.latitude != null && { latitude: this.adToSave.latitude }),
                ...(this.adToSave.longitude != null && { longitude: this.adToSave.longitude }),
                ...(this.adToSave.renter != null && { renter: this.adToSave.renter }),
                ...(this.adToSave.roomCount != null && { roomCount: this.adToSave.roomCount }),
                ...(this.adToSave.stations != null && this.adToSave.stations.length && { stations: this.adToSave.stations }),
                ...(this.adToSave.yearBuilt != null && this.adToSave.yearBuilt.length && { yearBuilt: this.adToSave.yearBuilt }),
            })
            log.info('saving ad')
            rent.save()
                .then(() => {
                    log.info('ad saved', 'green')
                })
                .catch(err => {
                    if (err.code === 11000) {
                        log.info('⚠️  ad already saved', 'red')
                    } else {
                        console.log(err)
                    }
                })
        }
    }
}
