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
  isFake?: boolean
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
      ...this.saveIfNotNull('dpe'),
      ...this.saveIfNotFalse('isFake'),
      ...this.saveIfNotNull('address'),
      ...this.saveIfNotNull('postalCode'),
      ...this.saveIfNotNull('hasFurniture'),
      ...this.saveIfNotNull('isHouse'),
      ...this.saveIfNotNull('latitude'),
      ...this.saveIfNotNull('longitude'),
      ...this.saveIfNotNull('renter'),
      ...this.saveIfNotNull('roomCount'),
      ...this.saveIfNotEmpty('stations'),
      ...this.saveIfNotEmpty('yearBuilt'),
    })

    PrettyLog.call('saving ad')

    try {
      await rent.save()
      PrettyLog.call('ad saved', 'green')
    } catch (err) {
      if (err.code === 11000) {
        PrettyLog.call('⚠️ ad already saved', 'red')
        await Rent.updateOne({ ...err.keyValue }, { lastSeen: new Date() })
      } else {
        console.error(err)
      }
    }
  }

  private saveIfNotNull(key: string) {
    return (this.adToSave[key] != null && {
      [key]: this.adToSave[key],
    })
  }

  private saveIfNotEmpty(key: string) {
    return (this.adToSave[key] != null &&
      this.adToSave[key].length && {
      [key]: this.adToSave[key],
    })
  }

  private saveIfNotFalse(key: string) {
    return (this.adToSave[key] != null &&
      this.adToSave[key] !== false && {
      [key]: this.adToSave[key],
    })
  }
}
