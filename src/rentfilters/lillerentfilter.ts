import { CleanAd } from "@interfaces/ad";
import { EncadrementItem, LilleEncadrementItem } from "@interfaces/json-item";
import { RentFilterStrategy } from "@interfaces/rentfilter";
import { DistrictService } from "@services/district";
import { YearBuiltService } from "@services/year-built";
import * as fs from 'fs';
import path from "path";


const rangeRentsLille: LilleEncadrementItem[] = JSON.parse(fs.readFileSync(path.join('json-data/encadrements_lille.json'), 'utf8'))

export class LilleRentFilter implements RentFilterStrategy {
    filter(cleanAd: CleanAd): EncadrementItem {
        const rangeTime = ['Avant 1946', '1971-1990', '1946-1970', 'Apres 1990']

        const districtsMatched = new DistrictService(
            cleanAd.city,
            cleanAd.postalCode,
            cleanAd.coordinates || cleanAd.blurryCoordinates,
        ).getDistricts()


        const timeDates = YearBuiltService.getRangeTimeDates(rangeTime, cleanAd.yearBuilt)

        const rentList = rangeRentsLille.filter((rangeRent) => {
            return (districtsMatched ? districtsMatched.map(district => district.properties.c_qu).includes(rangeRent.fields.zone) : true)
                && (timeDates?.length ? timeDates.includes(rangeRent.fields.epoque_construction) : true)
                && (cleanAd.roomCount ? +cleanAd.roomCount < 5 ? +rangeRent.fields.nb_pieces === +cleanAd.roomCount : +rangeRent.fields.nb_pieces === 4 : true)
                && (cleanAd.hasFurniture != null ? cleanAd.hasFurniture ? rangeRent.fields.loyer_de_reference_majore_meublees : rangeRent.fields.loyer_de_reference_majore_non_meublees : true)
        })
        // Get the worst case scenario
        return rentList.length ? rentList.reduce((prev, current) => (prev.fields.loyer_de_reference_majore_meublees > current.fields.loyer_de_reference_majore_meublees) ? prev : current) : null

    }
}