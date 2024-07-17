import {
  BordeauxAddress,
  EstEnsembleAddress,
  LilleAddress,
  LyonAddress,
  MontpellierAddress,
  ParisAddress,
  PlaineCommuneAddress,
} from '@db/db'
import { DataGouvAddress } from '@interfaces/address'
import { Coordinate, AddressItemDB, DefaultAddressItemDB } from '@interfaces/shared'
import { AvailableCities, getMainCity } from '@services/filters/city-filter/city-list'
import axios from 'axios'

const dbMapping = {
  paris: ParisAddress,
  lyon: LyonAddress,
  lille: LilleAddress,
  plaineCommune: PlaineCommuneAddress,
  estEnsemble: EstEnsembleAddress,
  montpellier: MontpellierAddress,
  bordeaux: BordeauxAddress,
}

export abstract class AddressService {
  abstract getAddress(): Promise<[string, Coordinate, Coordinate]>

  static async getAddresses(city: AvailableCities, query: string): Promise<AddressItemDB[]> {
    const addressDb = dbMapping[getMainCity(city)]
    const limit = 5

    if (addressDb) {
      return (await addressDb
        .find(
          {
            $text: { $search: query },
          },
          { score: { $meta: 'textScore' } }
        )
        .sort({ score: { $meta: 'textScore' } })
        .limit(limit)
        .lean()) as DefaultAddressItemDB[]
    }

    const result = await axios.get(`https://api-adresse.data.gouv.fr/search/?q=${query}+${city}&limit=${limit}&autocomplete=1`)
    const dataGouv: DataGouvAddress = result.data
    return this.dataGouvAddressToAddressItemDB(dataGouv)
  }

  private static dataGouvAddressToAddressItemDB(dataGouv: DataGouvAddress): AddressItemDB[] {
    return dataGouv.features.map((feature) => ({
      id: feature.properties.id,
      numero: feature.properties.housenumber,
      rep: '',
      nom_voie: feature.properties.street,
      code_postal: feature.properties.postcode,
      code_insee: '',
      nom_commune: feature.properties.city,
      code_insee_ancienne_commune: '',
      nom_ancienne_commune: '',
      x: feature.properties.x.toString(),
      y: feature.properties.y.toString(),
      lon: feature.geometry.coordinates[0].toString(),
      lat: feature.geometry.coordinates[1].toString(),
      libelle_acheminement: '',
      nom_afnor: '',
      source_position: '',
      source_nom_voie: '',
      geometry: {
        ...feature.geometry,
      },
      score: feature.properties.score,
      districtName: null,
      fields: {
        l_adr: feature.properties.name
      }
    }))
  }
}
