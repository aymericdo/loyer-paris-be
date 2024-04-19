export interface LyonEncadrementItem {
  zone: number
  meuble: boolean
  nombre_de_piece: string
  annee_de_construction: string
  prix_min: string
  prix_med: string
  prix_max: string
}

export interface UnitItem {
  loyer_reference: number
  majoration_unitaire: number
  loyer_reference_majore: number
  loyer_reference_minore: number
}

export interface UnitItemComplete extends UnitItem {
  zone: string
  roomCount: string
  yearBuilt: string
  isFurnished: string
}

export interface LyonDistrictItem {
  type: 'Feature'
  properties: {
    zonage: string
    commune: string
  }
  geometry: {
    type: 'Polygon'
    coordinates: number[][][]
  }
}

export interface BordeauxDistrictItem {
  type: 'Feature'
  properties: {
    com_code: number
    zonage: string
    commune: string
  }
  geometry: {
    type: 'Polygon'
    coordinates: number[][][]
  }
}
