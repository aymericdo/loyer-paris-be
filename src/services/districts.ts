import path from 'path'
import { Memoize } from 'typescript-memoize'
import * as fs from 'fs'

export class DistrictsList {
  @Memoize()
  parisGeodata() {
    return JSON.parse(
      fs.readFileSync(
        path.join('json-data/quartier_paris_geodata.json'),
        'utf8'
      )
    )
  }

  @Memoize()
  lilleGeodata() {
    return JSON.parse(
      fs.readFileSync(
        path.join('json-data/quartier_lille_geodata.json'),
        'utf8'
      )
    )
  }

  @Memoize()
  plaineCommuneGeodata() {
    return JSON.parse(
      fs.readFileSync(
        path.join('json-data/quartier_plaine-commune_geodata.json'),
        'utf8'
      )
    )
  }

  @Memoize()
  estEnsembleGeodata() {
    return JSON.parse(
      fs.readFileSync(
        path.join('json-data/quartier_est-ensemble_geodata.json'),
        'utf8'
      )
    )
  }

  @Memoize()
  lyonGeodata() {
    return JSON.parse(
      fs.readFileSync(path.join('json-data/encadrements_lyon.json'), 'utf8')
    )
  }
}
