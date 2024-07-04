import { AvailableCities } from '@services/filters/city-filter/city-list'
import { AddressDefault } from '@services/diggers/address/address-default'
import { AddressParis } from '@services/diggers/address/address-paris'

export class AddressServiceFactory {
  city: AvailableCities

  constructor(city: AvailableCities) {
    this.city = city
  }

  currentAddressService() {
    switch (this.city) {
      case 'paris': {
        return AddressParis
      }
      default: {
        return AddressDefault
      }
    }
  }
}