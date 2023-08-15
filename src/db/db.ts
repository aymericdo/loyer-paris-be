import { createConnection } from 'mongoose'

const localConnectionString = 'mongodb://localhost/loyer-paris-be'

const rentConnection = createConnection(process.env.MONGODB_URI || localConnectionString)

const empriseBatieConnection = createConnection(process.env.MONGODB_URI_EMPRISE_BATIE || localConnectionString)

const encadrementAddress1Connection = createConnection(
  process.env.MONGODB_URI_ENCADREMENT_ADDRESS1 || localConnectionString)

const encadrementAddress2Connection = createConnection(
  process.env.MONGODB_URI_ENCADREMENT_ADDRESS2 || localConnectionString
)

const rentSchema = require('./rent.model')
const incompleteRentSchema = require('./incomplete-rent.model')
const empriseBatieSchema = require('./emprisebatie.model')
const parisAddressSchema = require('./paris-address.model')
const lilleAddressSchema = require('./lille-address.model')
const plaineCommuneAddressSchema = require('./plaine_commune-address.model')
const lyonAddressSchema = require('./lyon-address.model')
const estEnsembleAddressSchema = require('./est_ensemble-address.model')
const montpellierAddressSchema = require('./montpellier-address.model')
const bordeauxAddressSchema = require('./bordeaux-address.model')

export const Rent = rentConnection.model('Rent', rentSchema)
export const IncompleteRent = rentConnection.model('IncompleteRent', incompleteRentSchema)
export const EmpriseBatie = empriseBatieConnection.model('Batie', empriseBatieSchema)

export const ParisAddress = encadrementAddress1Connection.model('parisaddress', parisAddressSchema)

export const LilleAddress = encadrementAddress1Connection.model('lilleaddress', lilleAddressSchema)

export const PlaineCommuneAddress = encadrementAddress1Connection.model(
  'plainecommuneaddress',
  plaineCommuneAddressSchema
)

export const LyonAddress = encadrementAddress2Connection.model('lyonaddress', lyonAddressSchema)

export const EstEnsembleAddress = encadrementAddress2Connection.model('estensembleaddress', estEnsembleAddressSchema)

export const MontpellierAddress = encadrementAddress2Connection.model('montpellieraddresses', montpellierAddressSchema)

export const BordeauxAddress = encadrementAddress2Connection.model('bordeauxaddresses', bordeauxAddressSchema)

export const closeAllConnections = async () => {
  await rentConnection.close()
  await empriseBatieConnection.close()
  await encadrementAddress1Connection.close()
  await encadrementAddress2Connection.close()
}
