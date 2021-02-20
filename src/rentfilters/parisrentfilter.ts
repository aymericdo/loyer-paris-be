import { CleanAd } from "@interfaces/ad";
import { ParisEncadrementItem } from "@interfaces/json-item";
import { RentFilterStrategy } from "@interfaces/rentfilter";
import { DistrictService } from "@services/district";
import { YearBuiltService } from "@services/year-built";
import * as fs from 'fs';
import path from "path";

const rangeRentsParis: ParisEncadrementItem[] = JSON.parse(fs.readFileSync(path.join('json-data/encadrements_paris.json'), 'utf8'))

export class ParisRentFilter implements RentFilterStrategy {
    filter(cleanAd: CleanAd): ParisEncadrementItem {
        // Extract possible range time from rangeRents (json-data/encadrements_*.json)
        const rangeTime = ['Avant 1946', '1971-1990', '1946-1970', 'Apres 1990']

        const districtsMatched = new DistrictService(
            cleanAd.city,
            cleanAd.postalCode,
            cleanAd.coordinates || cleanAd.blurryCoordinates,
        ).getDistricts()


        const timeDates = YearBuiltService.getRangeTimeDates(rangeTime, cleanAd.yearBuilt)

        const rentList = rangeRentsParis.filter((rangeRent) => {
            return (districtsMatched ? districtsMatched.map(district => district.properties.c_qu).includes(rangeRent.fields.id_quartier) : true)
                && (timeDates?.length ? timeDates.includes(rangeRent.fields.epoque) : true)
                && (cleanAd.roomCount ? +cleanAd.roomCount < 5 ? rangeRent.fields.piece === +cleanAd.roomCount : rangeRent.fields.piece === 4 : true)
                && (cleanAd.hasFurniture != null ? cleanAd.hasFurniture ? rangeRent.fields.meuble_txt.match(/^meubl/g) : rangeRent.fields.meuble_txt.match(/^non meubl/g) : true)
        })
        // Get the worst case scenario
        return rentList.length ? rentList.reduce((prev, current) => (prev.fields.max > current.fields.max) ? prev : current) : null

    }
}