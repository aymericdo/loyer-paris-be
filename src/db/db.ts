import mongoose, { Model } from 'mongoose'

import { PrettyLog } from '@services/helpers/pretty-log'

function makeNewConnection(uri: string) {
  const db = mongoose.createConnection(uri)

  db.on('error', function (error) {
    PrettyLog.call(
      `MongoDB :: connection ${this.name} ${JSON.stringify(error)}`,
      'red',
    )
    db.close().catch(() =>
      PrettyLog.call(`MongoDB :: failed to close connection ${this.name}`),
    )
  })

  db.on('connected', function () {
    if (process.env.CURRENT_ENV === 'dev') {
      mongoose.set('debug', function (col, method, query, doc) {
        PrettyLog.call(
          `MongoDB :: ${this.conn.name} ${col}.${method}(${JSON.stringify(query)},${JSON.stringify(doc)})`,
        )
      })
    }
    PrettyLog.call(`MongoDB :: connected ${this.name}`, 'green')
  })

  db.on('disconnected', function () {
    PrettyLog.call(`MongoDB :: disconnected ${this.name}`, 'green')
  })

  return db
}

// Use
const localConnectionString = 'mongodb://localhost/loyer-paris-be'

const rentConnection = makeNewConnection(
  process.env.MONGODB_URI || localConnectionString,
)
const empriseBatieConnection = makeNewConnection(
  process.env.MONGODB_URI_EMPRISE_BATIE || localConnectionString,
)
const encadrementZone1Connection = makeNewConnection(
  process.env.MONGODB_URI_ZONES || localConnectionString,
)

import rentSchema from './rent.model'
import incompleteRentSchema from './incomplete-rent.model'
import empriseBatieSchema from './emprisebatie.model'
import zoneSchema, { ZoneDocument } from './zone.model'

export const Rent = rentConnection.model('Rent', rentSchema)
export const IncompleteRent = rentConnection.model(
  'IncompleteRent',
  incompleteRentSchema,
)
export const EmpriseBatie = empriseBatieConnection.model(
  'Batie',
  empriseBatieSchema,
)

// https://www.data.gouv.fr/fr/datasets/resultats-des-observatoires-locaux-des-loyers-par-agglomeration/
export const LyonGeojson: Model<ZoneDocument> =
  encadrementZone1Connection.model<ZoneDocument>('lyongeojsons', zoneSchema)
export const LilleGeojson: Model<ZoneDocument> =
  encadrementZone1Connection.model<ZoneDocument>('lillegeojsons', zoneSchema)
export const PlaineCommuneGeojson: Model<ZoneDocument> =
  encadrementZone1Connection.model<ZoneDocument>(
    'plainecommunegeojsons',
    zoneSchema,
  )
export const EstEnsembleGeojson: Model<ZoneDocument> =
  encadrementZone1Connection.model<ZoneDocument>(
    'estensemblegeojsons',
    zoneSchema,
  )
export const ParisGeojson: Model<ZoneDocument> =
  encadrementZone1Connection.model<ZoneDocument>('parisgeojsons', zoneSchema)
export const MontpellierGeojson: Model<ZoneDocument> =
  encadrementZone1Connection.model<ZoneDocument>(
    'montpelliergeojsons',
    zoneSchema,
  )
export const BordeauxGeojson: Model<ZoneDocument> =
  encadrementZone1Connection.model<ZoneDocument>('bordeauxgeojsons', zoneSchema)
export const PaysBasqueGeojson: Model<ZoneDocument> =
  encadrementZone1Connection.model<ZoneDocument>(
    'paysbasquegeojsons',
    zoneSchema,
  )
export const GrenobleGeojson: Model<ZoneDocument> =
  encadrementZone1Connection.model<ZoneDocument>('grenoblegeojsons', zoneSchema)
export const ToulouseGeojson: Model<ZoneDocument> =
  encadrementZone1Connection.model<ZoneDocument>('toulousegeojsons', zoneSchema)
export const BrestGeojson: Model<ZoneDocument> =
  encadrementZone1Connection.model<ZoneDocument>('brestgeojsons', zoneSchema)
export const SaintMaloGeojson: Model<ZoneDocument> =
  encadrementZone1Connection.model<ZoneDocument>(
    'saintmalogeojsons',
    zoneSchema,
  )
export const AlençonGeojson: Model<ZoneDocument> =
  encadrementZone1Connection.model<ZoneDocument>('alencongeojsons', zoneSchema)
export const RennesGeojson: Model<ZoneDocument> =
  encadrementZone1Connection.model<ZoneDocument>('rennesgeojsons', zoneSchema)
export const LaRochelleGeojson: Model<ZoneDocument> =
  encadrementZone1Connection.model<ZoneDocument>(
    'larochellegeojsons',
    zoneSchema,
  )
export const ToulonGeojson: Model<ZoneDocument> =
  encadrementZone1Connection.model<ZoneDocument>('toulongeojsons', zoneSchema)
export const AnnecyGeojson: Model<ZoneDocument> =
  encadrementZone1Connection.model<ZoneDocument>('annecygeojsons', zoneSchema)
export const MarseilleGeojson: Model<ZoneDocument> =
  encadrementZone1Connection.model<ZoneDocument>(
    'marseillegeojsons',
    zoneSchema,
  )
export const NiceGeojson: Model<ZoneDocument> =
  encadrementZone1Connection.model<ZoneDocument>('nicegeojsons', zoneSchema)
export const NantesGeojson: Model<ZoneDocument> =
  encadrementZone1Connection.model<ZoneDocument>('nantesgeojsons', zoneSchema)
export const StrasbourgGeojson: Model<ZoneDocument> =
  encadrementZone1Connection.model<ZoneDocument>(
    'strasbourggeojsons',
    zoneSchema,
  )
export const NancyGeojson: Model<ZoneDocument> =
  encadrementZone1Connection.model<ZoneDocument>('nancygeojsons', zoneSchema)
export const ToursGeojson: Model<ZoneDocument> =
  encadrementZone1Connection.model<ZoneDocument>('toursgeojsons', zoneSchema)
export const ArrasGeojson: Model<ZoneDocument> =
  encadrementZone1Connection.model<ZoneDocument>('arrasgeojsons', zoneSchema)
export const VannesGeojson: Model<ZoneDocument> =
  encadrementZone1Connection.model<ZoneDocument>('vannesgeojsons', zoneSchema)
export const ClermontFerrandGeojson: Model<ZoneDocument> =
  encadrementZone1Connection.model<ZoneDocument>(
    'clermontferrandgeojsons',
    zoneSchema,
  )
export const BastiaGeojson: Model<ZoneDocument> =
  encadrementZone1Connection.model<ZoneDocument>('bastiageojsons', zoneSchema)
export const AjaccioGeojson: Model<ZoneDocument> =
  encadrementZone1Connection.model<ZoneDocument>('ajacciogeojsons', zoneSchema)
export const ArlesGeojson: Model<ZoneDocument> =
  encadrementZone1Connection.model<ZoneDocument>('arlesgeojsons', zoneSchema)

export const closeAllConnections = async () => {
  await rentConnection.close()
  await empriseBatieConnection.close()
  await encadrementZone1Connection.close()
}
