import { CleanAd } from '@interfaces/ad'
import { EncadrementItem } from '@interfaces/json-item'
import { YearBuiltService } from '@services/year-built'
import * as fs from 'fs'
import * as path from 'path'
import { DistrictService } from './district'

export class RentFilterService {
    city: string
    cleanAd: CleanAd = null
    rangeRents: EncadrementItem[]

    constructor(
        city: string,
        cleanAd: CleanAd,
    ) {
        this.city = city
        this.cleanAd = cleanAd
        if (this.city === "paris") {
            this.rangeRents = JSON.parse(fs.readFileSync(path.join('json-data/encadrements.json'), 'utf8'))
        }
        else if (this.city === "lille") {
            this.rangeRents = JSON.parse(fs.readFileSync(path.join('json-data/encadrement-des-loyers-a-lille-lomme-et-hellemmes-referentiel.json'), 'utf8'))
        }
        else {
            console.error("city not correct for district")
        }
    }

    filter(): EncadrementItem {
        // Extract possible range time from rangeRents (json-data/encadrements.json)
        const rangeTime = ['Avant 1946', '1971-1990', '1946-1970', 'Apres 1990']

        const districtsMatched = new DistrictService(
            this.city,
            this.cleanAd.coordinates || this.cleanAd.blurryCoordinates,
            this.cleanAd.postalCode,
            this.cleanAd.stations
        ).getDistricts()

        const timeDates = YearBuiltService.getRangeTimeDates(rangeTime, this.cleanAd.yearBuilt)

        const rentList = this.rangeRents.filter((rangeRent) => {
            return (districtsMatched.map(district => district.fields.c_qu).includes(rangeRent.fields.id_quartier))
                && (timeDates?.length ? timeDates.includes(rangeRent.fields.epoque) : true)
                && (this.cleanAd.roomCount ? +this.cleanAd.roomCount < 5 ? rangeRent.fields.piece === +this.cleanAd.roomCount : rangeRent.fields.piece === 4 : true)
                && (this.cleanAd.hasFurniture != null ? this.cleanAd.hasFurniture ? rangeRent.fields.meuble_txt.match(/^meubl/g) : rangeRent.fields.meuble_txt.match(/^non meubl/g) : true)
        })

        // Get the worst case scenario
        return rentList.length ? rentList.reduce((prev, current) => (prev.fields.max > current.fields.max) ? prev : current) : null
    }
}
