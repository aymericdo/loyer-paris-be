import * as cleanup from '@helpers/cleanup'
import { regexString } from '@helpers/regex'
import { stringToNumber } from '@helpers/string-to-number'
import { Ad } from '@interfaces/ad'
import { AddressInfo, Coordinate } from '@interfaces/shared'
import * as addressService from '@services/address'
import * as stationService from '@services/station'
import * as yearBuiltService from '@services/year-built'
import { AddressService } from './address';

export class DigService {
    ad: Ad = null

    constructor (
        ad: Ad,
    ) {
        this.ad = ad;
    }

    public digForAddress(): [string, string, string, Coordinate] {
        const addressService = new AddressService(this.ad)

        const postalCode = addressService.getPostalCode()
        const city = addressService.getCity()
        const address = addressService.getAddress()
        const coordinates = addressService.getCoordinate()

        return [address, postalCode, city, coordinates]
    }
    
    public digForRoomCount(): number {
        const roomsFromTitle = this.ad.title && this.ad.title.match(regexString('roomCount')) && this.ad.title.match(regexString('roomCount'))[0]
        const roomsFromDescription = this.ad.description && this.ad.description.match(regexString('roomCount')) && this.ad.description.match(regexString('roomCount'))[0]
        return (!!this.ad.rooms && this.ad.rooms) || stringToNumber(roomsFromTitle) || stringToNumber(roomsFromDescription)
    }
    
    public async digForYearBuilt(coordinates: Coordinate | null): Promise<number[]> {
        if (this.ad.yearBuilt && this.ad.yearBuilt != null && !isNaN(this.ad.yearBuilt)) {
            return [+this.ad.yearBuilt]
        } else {
            const building = coordinates && coordinates.lat && coordinates.lng &&
                await yearBuiltService.getBuilding(coordinates.lat, coordinates.lng)
            const yearBuiltFromBuilding = building && yearBuiltService.getYearBuiltFromBuilding(building)
    
            return yearBuiltFromBuilding
        }
    }
    
    public digForHasFurniture(): boolean {
        const furnitureFromTitle = this.ad.title && this.ad.title.match(regexString('furnished'))
        const nonFurnitureFromTitle = this.ad.title && this.ad.title.match(regexString('nonFurnished'))
        const furnitureFromDescription = this.ad.description && this.ad.description.match(regexString('furnished'))
        const nonFurnitureFromDescription = this.ad.description && this.ad.description.match(regexString('nonFurnished'))
        return this.ad.furnished != null
            ? !!this.ad.furnished
            : (furnitureFromDescription && furnitureFromDescription.length > 0
                || furnitureFromTitle && furnitureFromTitle.length > 0) ? true :
                (nonFurnitureFromDescription && nonFurnitureFromDescription.length > 0
                    || nonFurnitureFromTitle && nonFurnitureFromTitle.length > 0) ? false :
                    null
    }
    
    public digForSurface(): number {
        return this.ad.surface
            || this.ad.title && this.ad.title.match(regexString('surface')) && cleanup.number(this.ad.title.match(regexString('surface'))[0])
            || this.ad.description && this.ad.description.match(regexString('surface')) && cleanup.number(this.ad.description.match(regexString('surface'))[0])
    }
    
    public digForPrice(): number {
        return this.ad.price
    }
    
    public digForRenter(): string {
        const possibleBadRenter = ['seloger', 'loueragile', 'leboncoin', 'lefigaro', 'pap', 'orpi', 'logicimmo']
        return possibleBadRenter.includes(this.ad.renter) ? null : this.ad.renter
    }
    
    public digForStations(): string[] {
        const stationsFromDescription = this.ad?.description && stationService.getStations(this.ad.description) as string[]
        return this.ad.stations || stationsFromDescription
    }
    
    public digForCharges(): number {
        return this.ad.charges || this.ad.description?.match(regexString('charges')) && cleanup.price(this.ad.description.match(regexString('charges'))[0])
    }
    
    public digForHasCharges(): boolean {
        return this.ad.hasCharges
    }
}
