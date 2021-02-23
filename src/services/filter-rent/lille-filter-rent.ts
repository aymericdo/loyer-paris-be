import * as fs from 'fs'
import * as path from 'path'
import { CleanAd, FilteredResult } from '@interfaces/ad'
import { YearBuiltService } from '@services/year-built'
import { LilleDistrictService } from './lille-district'
import { LilleEncadrementItem } from '@interfaces/json-item-lille'

const rangeRentsLille: LilleEncadrementItem[] = JSON.parse(fs.readFileSync(path.join('json-data/encadrements_lille.json'), 'utf8'))

export class LilleFilterRentService {
    cleanAd: CleanAd = null
    
    constructor(
        cleanAd: CleanAd,
    ) {
        this.cleanAd = cleanAd
    }

    filter(): FilteredResult {
        // Extract possible range time from rangeRents (json-data/encadrements_lille.json)
        const rangeTime = ['Avant 1946', '1971-1990', '1946-1970', 'Apres 1990']

        const districtsMatched = new LilleDistrictService(
            this.cleanAd.postalCode,
            this.cleanAd.coordinates || this.cleanAd.blurryCoordinates,
        ).getDistricts()

        const timeDates: string[] = this.dateFormatting(YearBuiltService.getRangeTimeDates(rangeTime, this.cleanAd.yearBuilt))

        const rentList = rangeRentsLille.filter((rangeRent) => {
            return (districtsMatched?.length ? districtsMatched.map(district => district.properties.zonage).includes(rangeRent.fields.zone) : true)
              && (timeDates?.length ? timeDates.includes(rangeRent.fields.epoque_construction) : true)
              && (this.cleanAd.roomCount ? +this.cleanAd.roomCount < 4 ? +rangeRent.fields.nb_pieces === +this.cleanAd.roomCount : rangeRent.fields.nb_pieces === '4 et +' : true)
        })

        const isFurnished = this.cleanAd.hasFurniture != null && this.cleanAd.hasFurniture

        // Get the worst case scenario
        const worstCase = isFurnished ?
            rentList.reduce((prev, current) => (prev.fields.loyer_de_reference_majore_meublees > current.fields.loyer_de_reference_majore_meublees) ? prev : current)
          :
            rentList.reduce((prev, current) => (prev.fields.loyer_de_reference_majore_non_meublees > current.fields.loyer_de_reference_majore_non_meublees) ? prev : current)

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
}
