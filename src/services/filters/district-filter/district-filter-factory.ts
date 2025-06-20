import { AvailableMainCities } from '@services/city-config/main-cities'
import { EstEnsembleDistrictFilter } from './est-ensemble-district-filter'
import { ParisDistrictFilter } from './paris-district-filter'
import { PlaineCommuneDistrictFilter } from './plaine-commune-district-filter'
import { GrenobleDistrictFilter } from '@services/filters/district-filter/grenoble-district-filter'
import {
  AjaccioGeojson,
  AlençonGeojson,
  AnnecyGeojson,
  ArlesGeojson,
  ArrasGeojson,
  BastiaGeojson,
  BordeauxGeojson,
  BrestGeojson,
  ClermontFerrandGeojson,
  FréjusGeojson,
  LaRochelleGeojson,
  LilleGeojson,
  LyonGeojson,
  MarseilleGeojson,
  MontpellierGeojson,
  NancyGeojson,
  NantesGeojson,
  NiceGeojson,
  PaysBasqueGeojson,
  RennesGeojson,
  SaintMaloGeojson,
  StrasbourgGeojson,
  ToulonGeojson,
  ToulouseGeojson,
  ToursGeojson,
  VannesGeojson,
} from '@db/db'
import { GenericDistrictFilter } from '@services/filters/district-filter/generic-district-filter'
import { DistrictFilterParent } from '@services/filters/district-filter/district-filter-parent'
import { AvailableCities } from '@services/city-config/classic-cities'
import { Coordinate } from '@interfaces/shared'
import { ZoneDocument } from '@db/zone.model'
import { Model } from 'mongoose'

export class DistrictFilterFactory {
  mainCity: AvailableMainCities

  private genericConfigs: Partial<
    Record<AvailableMainCities, Model<ZoneDocument>>
  > = {
    lyon: LyonGeojson,
    paysBasque: PaysBasqueGeojson,
    montpellier: MontpellierGeojson,
    bordeaux: BordeauxGeojson,
    lille: LilleGeojson,
    brest: BrestGeojson,
    toulouse: ToulouseGeojson,
    'saint-malo': SaintMaloGeojson,
    alençon: AlençonGeojson,
    'la rochelle': LaRochelleGeojson,
    rennes: RennesGeojson,
    toulon: ToulonGeojson,
    annecy: AnnecyGeojson,
    marseille: MarseilleGeojson,
    nice: NiceGeojson,
    nantes: NantesGeojson,
    strasbourg: StrasbourgGeojson,
    nancy: NancyGeojson,
    tours: ToursGeojson,
    arras: ArrasGeojson,
    vannes: VannesGeojson,
    'clermont-ferrand': ClermontFerrandGeojson,
    bastia: BastiaGeojson,
    ajaccio: AjaccioGeojson,
    arles: ArlesGeojson,
    fréjus: FréjusGeojson,
  }

  constructor(mainCity: AvailableMainCities) {
    this.mainCity = mainCity
  }

  currentDistrictFilter(options: {
    coordinates?: Coordinate
    city?: AvailableCities
    postalCode?: string
    districtName?: string
  }): DistrictFilterParent {
    if (Object.keys(this.genericConfigs).includes(this.mainCity)) {
      const geojson = this.genericConfigs[this.mainCity]
      return new GenericDistrictFilter(this.mainCity, geojson, options)
    }

    switch (this.mainCity) {
      case 'paris':
        return new ParisDistrictFilter(options)
      case 'plaineCommune':
        return new PlaineCommuneDistrictFilter(options)
      case 'estEnsemble':
        return new EstEnsembleDistrictFilter(options)
      case 'grenoble':
        return new GrenobleDistrictFilter(options)
    }
  }
}
