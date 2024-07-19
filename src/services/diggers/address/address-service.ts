import { DataGouvAddress, DataGouvAddressItem } from '@interfaces/address'
import { Coordinate } from '@interfaces/shared'
import { AvailableCities } from '@services/filters/city-filter/city-list'
import { codeInsee } from '@services/filters/city-filter/code-insee'
import { PrettyLog } from '@services/helpers/pretty-log'
import axios from 'axios'

export abstract class AddressService {
  abstract getAddress(): Promise<[string, Coordinate, Coordinate]>

  static async getAddresses(city: AvailableCities, query: string): Promise<DataGouvAddressItem[]> {
    const limit = 5

    try {
      const result = await axios.get(`https://api-adresse.data.gouv.fr/search/?q=${query}+${city}&limit=${limit}&citycode=${codeInsee(city)}&autocomplete=1`)
      const dataGouv: DataGouvAddress = result.data
      return dataGouv.features
    } catch (error) {
      PrettyLog.call(JSON.stringify(error), 'red')
    }
  }
}
