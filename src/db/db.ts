import { PrettyLog } from '@services/helpers/pretty-log'

const mongoose = require('mongoose')

function makeNewConnection(uri: string) {
  const db = mongoose.createConnection(uri)

  db.on('error', function (error) {
    PrettyLog.call(`MongoDB :: connection ${this.name} ${JSON.stringify(error)}`, 'red')
    db.close().catch(() => PrettyLog.call(`MongoDB :: failed to close connection ${this.name}`))
  })

  db.on('connected', function () {
    if (process.env.CURRENT_ENV === 'dev') {
      mongoose.set('debug', function (col, method, query, doc) {
        PrettyLog.call(`MongoDB :: ${this.conn.name} ${col}.${method}(${JSON.stringify(query)},${JSON.stringify(doc)})`)
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

const rentConnection = makeNewConnection(process.env.MONGODB_URI || localConnectionString)
const empriseBatieConnection = makeNewConnection(process.env.MONGODB_URI_EMPRISE_BATIE || localConnectionString)
const encadrementZone1Connection = makeNewConnection(process.env.MONGODB_URI_ZONES || localConnectionString)

const rentSchema = require('./rent.model')
const incompleteRentSchema = require('./incomplete-rent.model')
const empriseBatieSchema = require('./emprisebatie.model')
const zoneSchema = require('./zone.model')

export const Rent = rentConnection.model('Rent', rentSchema)
export const IncompleteRent = rentConnection.model('IncompleteRent', incompleteRentSchema)
export const EmpriseBatie = empriseBatieConnection.model('Batie', empriseBatieSchema)

// https://www.data.gouv.fr/fr/datasets/resultats-des-observatoires-locaux-des-loyers-par-agglomeration/
export const LyonGeojson = encadrementZone1Connection.model('lyongeojsons', zoneSchema)
export const LilleGeojson = encadrementZone1Connection.model('lillegeojsons', zoneSchema)
export const PlaineCommuneGeojson = encadrementZone1Connection.model('plainecommunegeojsons', zoneSchema)
export const EstEnsembleGeojson = encadrementZone1Connection.model('estensemblegeojsons', zoneSchema)
export const ParisGeojson = encadrementZone1Connection.model('parisgeojsons', zoneSchema)
export const MontpellierGeojson = encadrementZone1Connection.model('montpelliergeojsons', zoneSchema)
export const BordeauxGeojson = encadrementZone1Connection.model('bordeauxgeojsons', zoneSchema)
export const PaysBasqueGeojson = encadrementZone1Connection.model('paysbasquegeojsons', zoneSchema)

export const closeAllConnections = async () => {
  await rentConnection.close()
  await empriseBatieConnection.close()
  await encadrementZone1Connection.close()
}
