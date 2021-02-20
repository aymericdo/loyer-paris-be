import * as fs from 'fs'
import * as path from 'path'
import { LilleEncadrementItem, ParisEncadrementItem } from '@interfaces/json-item'
import { DistrictService } from './district'
import { CleanAd } from '@interfaces/ad'
import { YearBuiltService } from '@services/year-built'

const rangeRentsParis: ParisEncadrementItem[] = JSON.parse(fs.readFileSync(path.join('json-data/encadrements_paris.json'), 'utf8'))
const rangeRentsLille: LilleEncadrementItem[] = JSON.parse(fs.readFileSync(path.join('json-data/encadrements_lille.json'), 'utf8'))

const rangeRents = {
    paris: {
        file: rangeRentsParis,
        fields: {
            piece: 'piece',
            epoque: 'epoque',
        }
    },
    lille: {
        file: rangeRentsLille,
        fields: {
            piece: 'nb_pieces',
            epoque: 'epoque_construction',
        }
    }
};

export class RentFilterService {
    cleanAd: CleanAd = null

    constructor(
        cleanAd: CleanAd,
    ) {
        this.cleanAd = cleanAd
    }

    filter(): ParisEncadrementItem {
        // Extract possible range time from rangeRents (json-data/encadrements_*.json)
        const rangeTime = ['Avant 1946', '1971-1990', '1946-1970', 'Apres 1990']

        console.log(this.cleanAd)

        const districtsMatched = new DistrictService(
            this.cleanAd.city,
            this.cleanAd.postalCode,
            this.cleanAd.coordinates || this.cleanAd.blurryCoordinates,
        ).getDistricts()

        console.log(districtsMatched)

        const timeDates = YearBuiltService.getRangeTimeDates(rangeTime, this.cleanAd.yearBuilt)
        console.log(districtsMatched)

        const rentList = rangeRents[this.cleanAd.city].filter((rangeRent) => {
            return (districtsMatched ? districtsMatched.map(district => district.properties.c_qu).includes(rangeRent.fields.id_quartier) : true)
                && (timeDates?.length ? timeDates.includes(rangeRent.fields[rangeRents[this.cleanAd.city].fields.epoque]) : true)
                && (this.cleanAd.roomCount ? +this.cleanAd.roomCount < 5 ? rangeRent.fields[rangeRents[this.cleanAd.city].fields.piece] === +this.cleanAd.roomCount : rangeRent.fields[rangeRents[this.cleanAd.city].fields.piece] === 4 : true)
                && (this.cleanAd.hasFurniture != null ? this.cleanAd.hasFurniture ? rangeRent.fields.meuble_txt.match(/^meubl/g) : rangeRent.fields.meuble_txt.match(/^non meubl/g) : true)
        })
        console.log(rangeRents[this.cleanAd.city])

        // Get the worst case scenario
        return rentList.length ? rentList.reduce((prev, current) => (prev.fields.max > current.fields.max) ? prev : current) : null
    }
}
