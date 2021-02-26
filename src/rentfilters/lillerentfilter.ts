import { CleanAd, FilteredResult } from "@interfaces/ad";
import { LilleDistrictItem, LilleEncadrementItem } from "@interfaces/json-item-lille";
import { RentFilterStrategy } from "@rentfilters/rentfilter";
import { Coordinate } from "@interfaces/shared";
import { YearBuiltService } from "@services/year-built";
import * as fs from 'fs';
import path from "path";
import inside from "point-in-polygon";

const rangeRentsLille: LilleEncadrementItem[] = JSON.parse(fs.readFileSync(path.join('json-data/encadrements_lille.json'), 'utf8'))
const lilleDistricts: { features: LilleDistrictItem[] } = JSON.parse(fs.readFileSync(path.join('json-data/quartier_lille_geodata.json'), 'utf8'))

export class LilleRentFilter implements RentFilterStrategy {
    city: string;
    constructor(
        city: string,
    ) {
        this.city = city
    }
    filter(cleanAd: CleanAd): FilteredResult {
        // Extract possible range time from rangeRents (json-data/encadrements_lille.json)
        const rangeTime = ['Avant 1946', '1971-1990', '1946-1970', 'Apres 1990']

        const districtsMatched = this.getDistricts(cleanAd.coordinates || cleanAd.blurryCoordinates)

        const timeDates: string[] = this.dateFormatting(YearBuiltService.getRangeTimeDates(rangeTime, cleanAd.yearBuilt))

        const rentList = rangeRentsLille.filter((rangeRent) => {
            return (districtsMatched?.length ? districtsMatched.map(district => district.properties.zonage).includes(rangeRent.fields.zone) : true)
                && (timeDates?.length ? timeDates.includes(rangeRent.fields.epoque_construction) : true)
                && (cleanAd.roomCount ? +cleanAd.roomCount < 5 ? +rangeRent.fields.nb_pieces === +cleanAd.roomCount : +rangeRent.fields.nb_pieces === 4 : true)
        })

        const isFurnished = cleanAd.hasFurniture != null && cleanAd.hasFurniture

        // Get the worst case scenario
        const worstCase = rentList.length ? (
            isFurnished ?
                rentList.reduce((prev, current) => (prev.fields.loyer_de_reference_majore_meublees > current.fields.loyer_de_reference_majore_meublees) ? prev : current)
                :
                rentList.reduce((prev, current) => (prev.fields.loyer_de_reference_majore_non_meublees > current.fields.loyer_de_reference_majore_non_meublees) ? prev : current)
        ) : null

        return {
            maxPrice: isFurnished ? +worstCase.fields.loyer_de_reference_majore_meublees : +worstCase.fields.loyer_de_reference_majore_non_meublees,
            minPrice: isFurnished ? +worstCase.fields.loyer_de_reference_minore_meublees : +worstCase.fields.loyer_de_reference_minore_non_meublees,
            districtName: `Zone ${worstCase.fields.zone}`,
            isFurnished,
            roomCount: +worstCase.fields.nb_pieces,
            yearBuilt: worstCase.fields.epoque_construction,
        }
    }

    private dateFormatting(timeDates: string[]): string[] {
        if (timeDates?.length) {
            timeDates.map(d => {
                switch (d) {
                    case 'Apres 1990': return '> 1990'
                    case '1971-1990': return '1971 - 1990'
                    case '1946-1970': return '1946 - 1970'
                    case 'Avant 1946': return '< 1946'
                    default: return ''
                }
            })
        } else {
            return null
        }
    }

    private getDistricts(coordinates: Coordinate): LilleDistrictItem[] {
        const districtFromCoordinate = coordinates && this.getDistrictFromCoordinate(coordinates.lat, coordinates.lng)

        return districtFromCoordinate ?
            districtFromCoordinate
            :
            null
    }

    private getDistrictFromCoordinate(lat: number, lng: number): LilleDistrictItem[] {
        const district = lilleDistricts.features.find(district => inside([+lng, +lat], district.geometry.coordinates[0]))
        return district ? [district] : []
    }
}