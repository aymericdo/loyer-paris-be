export interface BordeauxEncadrementItem {
  zone: number;
  maison: boolean;
  meuble: boolean;
  nombre_de_piece: string;
  annee_de_construction: string;
  prix_min: string;
  prix_med: string;
  prix_max: string;
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
