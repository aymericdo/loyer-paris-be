export interface DataGouvAddressItem {
  type: 'Feature'
  geometry: {
    type: 'Point'
    coordinates: [number, number]
  }
  properties: {
    label: string //'16 Boulevard Voltaire 75011 Paris'
    score: number // 0.776382337662338
    housenumber: string // '16'
    id: string // '75111_9907_00016'
    name: string // '16 Boulevard Voltaire'
    postcode: string // '75011'
    citycode: string // '75111'
    x: number // 653561.11
    y: number // 6863009.07
    city: string // 'Paris'
    street: string // 'Boulevard Voltaire'
  }
}

export interface DataGouvAddress {
  type: 'FeatureCollection'
  version: 'draft'
  features: DataGouvAddressItem[]
}

export interface FinalDataGouvAddressItem extends DataGouvAddressItem {
  districtName: string | null
}

// NEW TYPE
// from https://data.geopf.fr/geocodage/completion

export type AddressResult = {
  x: number
  y: number
  country: string
  city: string
  oldcity: string
  kind: string
  zipcode: string
  street: string
  metropole: boolean
  fulltext: string
  classification: number
}

export type AddressResponse = {
  status: string
  results: AddressResult[]
}
