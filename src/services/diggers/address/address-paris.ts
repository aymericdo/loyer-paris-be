import { ParisAddressItemDB } from '@interfaces/paris'
import { AddressItem } from '@interfaces/shared'
import { AddressDefault } from '@services/diggers/address/address-default'
import { AddressService } from '@services/diggers/address/address-service'
import { AvailableCities } from '@services/filters/city-filter/city-list'
import * as cleanup from '@services/helpers/cleanup'

export class AddressParis extends AddressDefault {
  protected async getAddressCompleted(
    city: AvailableCities,
    query: string
  ): Promise<
    {
      item: AddressItem
      score: number
      streetNumber: string
    }[]
  > {
    if (!query) {
      return null
    }

    const result: ParisAddressItemDB[] = await AddressService.getAddresses(city, query) as ParisAddressItemDB[]

    return result
      ? result.map((r: ParisAddressItemDB) => ({
        item: {
          address: r.fields.l_adr,
          postalCode: AddressParis.postalCodeFormat(r.fields.c_ar.toString()),
          coordinate: {
            lng: r.fields.geom.coordinates[0],
            lat: r.fields.geom.coordinates[1],
          },
        },
        score: r.score,
        streetNumber: cleanup.streetNumber(query)?.toString(),
      }))
      : []
  }

  static postalCodeFormat(postalCode: string): string {
    // 10 -> 75010 9 -> 75009
    return postalCode.length === 1 ? `7500${postalCode}` : `750${postalCode}`
  }
}
