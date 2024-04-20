export interface LyonEncadrementItem {
  zone: number
  meuble: boolean
  nombre_de_piece: string
  annee_de_construction: string
  prix_min: string
  prix_med: string
  prix_max: string
}

export interface LyonDistrictItem {
  type: 'Feature'
  properties: {
    Zone: string
  }
  geometry: {
    type: 'Polygon'
    coordinates: number[][][]
  }
}
