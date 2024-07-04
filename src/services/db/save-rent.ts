import { Rent } from '@db/db'
import { AvailableCities } from '@services/filters/city-filter/city-list'
import { PrettyLog } from '@services/helpers/pretty-log'

interface SavedInfo {
  id: string
  address: string
  district: string
  dpe?: string | null
  city: AvailableCities
  hasFurniture?: boolean
  isHouse?: boolean
  isLegal: boolean
  latitude?: number
  longitude?: number
  maxPrice: number
  postalCode: string
  price: number
  priceExcludingCharges: number
  renter?: string
  roomCount?: number
  stations?: string[]
  surface: number
  website: string
  url: string
  yearBuilt?: number[]
}

export class SaveRentService {
  adToSave: SavedInfo = null

  constructor(adToSave: SavedInfo) {
    this.adToSave = adToSave
  }

  async save(): Promise<void> {
    const rent = new Rent({
      id: this.adToSave.id,
      url: this.adToSave.url,
      website: this.adToSave.website,
      isLegal: this.adToSave.isLegal,
      maxPrice: this.adToSave.maxPrice,
      price: this.adToSave.price,
      priceExcludingCharges: this.adToSave.priceExcludingCharges,
      surface: this.adToSave.surface,
      city: this.adToSave.city,
      district: this.adToSave.district,
      ...(this.adToSave.dpe != null && {
        dpe: this.adToSave.dpe,
      }),
      ...(this.adToSave.address != null && {
        address: this.adToSave.address,
      }),
      ...(this.adToSave.postalCode != null && {
        postalCode: this.adToSave.postalCode,
      }),
      ...(this.adToSave.hasFurniture != null && {
        hasFurniture: this.adToSave.hasFurniture,
      }),
      ...(this.adToSave.isHouse != null && {
        isHouse: this.adToSave.isHouse,
      }),
      ...(this.adToSave.latitude != null && {
        latitude: this.adToSave.latitude,
      }),
      ...(this.adToSave.longitude != null && {
        longitude: this.adToSave.longitude,
      }),
      ...(this.adToSave.renter != null && { renter: this.adToSave.renter }),
      ...(this.adToSave.roomCount != null && {
        roomCount: this.adToSave.roomCount,
      }),
      ...(this.adToSave.stations != null &&
        this.adToSave.stations.length && {
        stations: this.adToSave.stations,
      }),
      ...(this.adToSave.yearBuilt != null &&
        this.adToSave.yearBuilt.length && {
        yearBuilt: this.adToSave.yearBuilt,
      }),
    })
    PrettyLog.call('saving ad')

    try {
      await rent.save()
      PrettyLog.call('ad saved', 'green')
    } catch (err) {
      if (err.code === 11000) {
        PrettyLog.call('⚠️  ad already saved', 'red')
      } else {
        console.error(err)
      }
    }
  }
}
