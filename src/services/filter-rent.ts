import * as fs from 'fs'
import * as path from 'path'
import { EncadrementItem } from '@interfaces/json-item'
import { DistrictService } from './district'
import { CleanAd } from '@interfaces/ad'
import { YearBuiltService } from '@services/year-built'

const rangeRents: EncadrementItem[] = JSON.parse(fs.readFileSync(path.join('json-data/encadrements_paris.json'), 'utf8'))

export class RentFilterService {
    cleanAd: CleanAd = null
    
    constructor(
        cleanAd: CleanAd,
    ) {
        this.cleanAd = cleanAd
    }

    filter(): EncadrementItem {
        // Extract possible range time from rangeRents (json-data/encadrements_*.json)
        const rangeTime = ['Avant 1946', '1971-1990', '1946-1970', 'Apres 1990']

        const districtsMatched = new DistrictService(
            this.cleanAd.postalCode,
            this.cleanAd.coordinates || this.cleanAd.blurryCoordinates,
        ).getDistricts()

        const timeDates = YearBuiltService.getRangeTimeDates(rangeTime, this.cleanAd.yearBuilt)

        const rentList = rangeRents.filter((rangeRent) => {
            return (districtsMatched ? districtsMatched.map(district => district.properties.c_qu).includes(rangeRent.fields.id_quartier) : true)
                && (timeDates?.length ? timeDates.includes(rangeRent.fields.epoque) : true)
                && (this.cleanAd.roomCount ? +this.cleanAd.roomCount < 5 ? rangeRent.fields.piece === +this.cleanAd.roomCount : rangeRent.fields.piece === 4 : true)
                && (this.cleanAd.hasFurniture != null ? this.cleanAd.hasFurniture ? rangeRent.fields.meuble_txt.match(/^meubl/g) : rangeRent.fields.meuble_txt.match(/^non meubl/g) : true)
        })
    
        // Get the worst case scenario
        return rentList.length ? rentList.reduce((prev, current) => (prev.fields.max > current.fields.max) ? prev : current) : null
    }
}
