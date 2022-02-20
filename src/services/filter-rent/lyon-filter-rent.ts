import { FilteredResult, InfoToFilter } from '@interfaces/ad';
import { YearBuiltService } from '@services/year-built';
import { LyonDistrictService } from './lyon-district';
import { LyonAddressItem, UnitItemComplete } from '@interfaces/json-item-lyon';
import { number } from '@helpers/cleanup';

export class LyonFilterRentService {
  infoToFilter: InfoToFilter = null

  constructor(infoToFilter: InfoToFilter) {
    this.infoToFilter = infoToFilter
  }

  filter(): FilteredResult[] {
    // Extract possible range time from rangeRents (json-data/encadrements_lyon.json)
    const rangeTime = ['avant 1946', '1946-70', '1971-90', 'après 1990'];

    const districtsMatched = new LyonDistrictService(
      this.infoToFilter.postalCode,
      this.infoToFilter.coordinates || this.infoToFilter.blurryCoordinates,
      this.infoToFilter.districtName
    ).getDistricts()

    const timeDates: string[] = new YearBuiltService(
      rangeTime,
      this.infoToFilter.yearBuilt
    ).getRangeTimeDates()

    const rentList: UnitItemComplete[] = this.bigFlatten(
      districtsMatched
    ).filter((rangeRent) => {
      return (
        (timeDates?.length ? timeDates.includes(rangeRent.yearBuilt) : true) &&
        (this.infoToFilter.roomCount
          ? +this.infoToFilter.roomCount < 4
            ? +rangeRent.roomCount === +this.infoToFilter.roomCount
            : rangeRent.roomCount === '4 et plus'
          : true) &&
        (this.infoToFilter.hasFurniture != null
          ? this.infoToFilter.hasFurniture
            ? rangeRent.isFurnished.match(/^meubl/g)
            : rangeRent.isFurnished.match(/^non meubl/g)
          : true)
      )
    });

    return rentList
      .map((r) => ({
        maxPrice: r.loyer_reference_majore,
        minPrice: r.loyer_reference_minore,
        districtName: `Zone ${r.zone}`,
        isFurnished: !!r.isFurnished.match(/^meubl/g),
        roomCount: r.roomCount,
        yearBuilt: r.yearBuilt,
      }))
      .sort((a, b) => {
        return rangeTime.indexOf(a.yearBuilt) - rangeTime.indexOf(b.yearBuilt)
      });
  }

  find(): FilteredResult {
    const rentList = this.filter()

    // Get the worst case scenario
    const worstCase = rentList.length
      ? rentList.reduce((prev, current) =>
        prev.maxPrice > current.maxPrice ? prev : current
      )
      : null

    return worstCase
  }

  private bigFlatten(list: LyonAddressItem[]): UnitItemComplete[] {
    return list.reduce((prev, val) => {
      const zone = val.properties.zonage
      Object.keys(val.properties.valeurs).forEach((roomCountItemKey) => {
        const roomCount = roomCountItemKey
        Object.keys(val.properties.valeurs[roomCountItemKey]).forEach(
          (yearBuiltItemKey) => {
            const yearBuilt = yearBuiltItemKey
            Object.keys(
              val.properties.valeurs[roomCountItemKey][yearBuilt]
            ).forEach((isFurnishedItemKey) => {
              const isFurnished = isFurnishedItemKey
              if (
                !prev.some((elem) => {
                  return (
                    elem.isFurnished === isFurnished &&
                    elem.zone === zone &&
                    elem.roomCount === roomCount &&
                    elem.yearBuilt === yearBuilt
                  )
                })
              ) {
                prev.push({
                  ...val.properties.valeurs[roomCountItemKey][yearBuilt][
                    isFurnishedItemKey
                  ],
                  zone,
                  roomCount,
                  yearBuilt,
                  isFurnished,
                })
              }
            })
          }
        )
      });
      return prev
    }, [])
  }
}
