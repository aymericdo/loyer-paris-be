import { Ad } from '@interfaces/ad'
import { AvailableCities } from '@services/filters/city-filter/valid-cities-list'
import { AddressService, DefaultAddressService } from '@services/diggers/address/address-default'
import { ParisAddressService } from '@services/diggers/address/address-paris'

export class AddressServiceFactory {
  getDiggerStrategy(city: AvailableCities, postalCode: string, ad: Ad): AddressService {
    switch (city) {
      case 'paris': {
        return new ParisAddressService(city, postalCode, ad)
      }
      default: {
        return new DefaultAddressService(city, postalCode, ad)
      }
    }
  }
}