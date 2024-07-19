import { AvailableCities } from '@services/filters/city-filter/city-list'
import { AddressDefault } from '@services/diggers/address/address-default'

export class AddressServiceFactory {
  city: AvailableCities

  constructor(city: AvailableCities) {
    this.city = city
  }

  currentAddressService() {
    return AddressDefault
  }
}