export interface Body {
  noMoreData?: boolean
  platform: string
  id: string
  url: string
  data: string
}

export interface FacebookMapping {
  id: string
  cityLabel: string
  description: string
  furnished: boolean
  price: string
  rooms: string
  surface: string
  title: string
}

export interface LeboncoinMapping {
  id: string
  cityLabel: string
  dpe: string | null
  body: string
  furnished: string
  hasCharges: boolean
  price: string
  renter: string
  rooms: string
  surface: string
  subject: string
  isHouse: boolean
}

export interface LefigaroMapping {
  id: string
  charges: string
  cityLabel: string
  description: string
  dpe: string | null
  furnished: boolean
  hasCharges: boolean
  price: string
  renter: string
  rooms: string
  surface: string
  title: string
}

export interface LogicimmoMapping {
  id: string
  charges: string
  hasCharges: boolean
  cityLabel: string
  title: string
  description: string
  dpe: string | null
  furnished: boolean
  price: string
  renter: string
  rooms: string
  surface: string
}

export interface OrpiMapping {
  id: string
  charges: string
  cityLabel: string
  description: string
  dpe: string | null
  furnished: boolean
  hasCharges: boolean
  price: string
  renter: string
  rooms: string
  surface: string
  title: string
}

export interface FonciaMapping {
  id: string
  charges: string
  cityLabel: string
  description: string
  dpe: string | null
  hasCharges: boolean
  price: string
  renter: string
  rooms: string
  surface: string
  title: string
  address: string
}

export interface AvendrealouerMapping {
  id: string
  charges: string
  cityLabel: string
  description: string
  furnished: boolean
  hasCharges: boolean
  price: string
  renter: string
  rooms: string
  surface: string
  title: string
  yearBuilt: string
}

export interface PapMapping {
  id: string
  cityLabel: string
  description: string
  dpe: string | null
  price: string
  charges: string
  rooms: string
  surface: string
  title: string
  stations: string[]
}

export interface SelogerMapping {
  id: string
  charges: string
  cityLabel: string
  description: string
  dpe: string | null
  furnished: boolean
  hasCharges: boolean
  price: string
  renter: string
  rooms: string
  surface: string
  title: string
  yearBuilt: string
}

export interface GensdeconfianceMapping {
  id: string
  charges: string
  cityLabel: string
  description: string
  hasCharges: boolean
  price: string
  address: string
  surface: string
  title: string
}

export interface LuxResidenceMapping {
  id: string
  cityLabel: string
  description: string
  furnished: boolean
  rooms: string
  price: string
  renter: string
  surface: string
  dpe: string
  charges: string
}

export interface BellesDemeuresMapping {
  id: string
  title: string
  cityLabel: string
  description: string
  furnished: boolean
  hasCharges: boolean
  price: string
  rooms: string
  renter: string
  surface: string
  dpe: string
}

export interface BienIciMapping {
  id: string
  title: string
  cityLabel: string
  description: string
  dpe: string | null
  furnished: boolean
  hasCharges: boolean
  charges: string
  price: string
  rooms: string
  renter: string
  surface: string
}

export interface FnaimMapping {
  id: string
  title: string
  cityLabel: string
  description: string
  hasCharges: boolean
  charges: string
  price: string
  dpe: string
  rooms: string
  yearBuilt: string
  renter: string
  surface: string
}

export interface SuperimmoMapping {
  id: string
  title: string
  cityLabel: string
  description: string
  dpe: string | null
  hasCharges: boolean
  charges: string
  price: string
  rooms: string
  yearBuilt: string
  renter: string
  surface: string
}

export interface LocserviceMapping {
  id: string
  title: string
  cityLabel: string
  dpe: string | null
  description: string
  hasCharges: boolean
  furnished: boolean
  price: string
  rooms: string
  surface: string
}
