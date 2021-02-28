import { CleanAd, FilteredResult } from "@interfaces/ad";
import { ParisDistrictItem, ParisEncadrementItem } from "@interfaces/json-item-paris";
import { RentFilterStrategy } from "@rentfilters/rentfilter";
import { Coordinate } from "@interfaces/shared";
import { YearBuiltService } from "@services/year-built";
import * as fs from 'fs';
import path from "path";
import inside from "point-in-polygon";
import { AvailableCities } from '@services/city';

const parisDistricts: { features: ParisDistrictItem[] } = JSON.parse(fs.readFileSync(path.join('json-data/quartier_paris_geodata.json'), 'utf8'))
const rangeRentsParis: ParisEncadrementItem[] = JSON.parse(fs.readFileSync(path.join('json-data/encadrements_paris.json'), 'utf8'))

export class ParisRentFilter implements RentFilterStrategy {
    city: AvailableCities;
    constructor(
        city: AvailableCities,
    ) {
        this.city = city
    }
    filter(cleanAd: CleanAd): FilteredResult {
        // Extract possible range time from rangeRents (json-data/encadrements_paris.json)
        const rangeTime = ['Avant 1946', '1971-1990', '1946-1970', 'Apres 1990']

        const districtsMatched = this.getDistricts(cleanAd.coordinates || cleanAd.blurryCoordinates, cleanAd.postalCode)

        const timeDates: string[] = YearBuiltService.getRangeTimeDates(rangeTime, cleanAd.yearBuilt)

        const rentList = rangeRentsParis.filter((rangeRent) => {
            return (districtsMatched?.length ? districtsMatched.map(district => district.properties.c_qu).includes(rangeRent.fields.id_quartier) : true)
                && (timeDates?.length ? timeDates.includes(rangeRent.fields.epoque) : true)
                && (cleanAd.roomCount ? +cleanAd.roomCount < 5 ? rangeRent.fields.piece === +cleanAd.roomCount : rangeRent.fields.piece === 4 : true)
                && (cleanAd.hasFurniture != null ? cleanAd.hasFurniture ? rangeRent.fields.meuble_txt.match(/^meubl/g) : rangeRent.fields.meuble_txt.match(/^non meubl/g) : true)
        })

        // Get the worst case scenario
        const worstCase = rentList.length ? rentList.reduce((prev, current) => (prev.fields.max > current.fields.max) ? prev : current) : null

        return {
            maxPrice: +worstCase.fields.max,
            minPrice: +worstCase.fields.min,
            districtName: worstCase.fields.nom_quartier,
            isFurnished: !!worstCase.fields.meuble_txt.match(/^meubl/g),
            roomCount: +worstCase.fields.piece,
            yearBuilt: worstCase.fields.epoque,
        }
    }

    getDistricts(coordinates: Coordinate, postalCode: string): ParisDistrictItem[] {
        const districtFromCoordinate = coordinates && this.getDistrictFromCoordinate(coordinates.lat, coordinates.lng)

        return districtFromCoordinate ?
            districtFromCoordinate
            :
            this.getDistrictFromPostalCode(postalCode)
    }

    getDistrictFromPostalCode(postalCode: string): ParisDistrictItem[] {
        if (postalCode) {
            // 75010 -> 10  75009 -> 9
            const code = postalCode.slice(-2)[0] === '0' ? postalCode.slice(-1) : postalCode.slice(-2)

            return parisDistricts.features.filter(district => {
                return district.properties.c_ar === +code;
            })
        } else {
            return []
        }
    }

    private getDistrictFromCoordinate(lat: number, lng: number): ParisDistrictItem[] {
        const district = parisDistricts.features.find(district => inside([+lng, +lat], district.geometry.coordinates[0]))
        return district ? [district] : []
    }
}