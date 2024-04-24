import { Ad } from '@interfaces/ad'
import { AddressService, DefaultAddressService } from '@services/address/default-address-service'
import { ParisAddressService } from '@services/address/paris-address-service'

export class AddressServiceFactory {
  getDiggerStrategy(city: string, postalCode: string, ad: Ad): AddressService {
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