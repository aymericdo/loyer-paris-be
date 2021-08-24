const mongoose = require('mongoose')

const localConnectionString = 'mongodb://localhost/loyer-paris-be'

const rentConnection = mongoose.createConnection(
  process.env.MONGODB_URI || localConnectionString,
  {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
)

rentConnection.catch((e) => {
  console.log(e)
})

const empriseBatieConnection = mongoose.createConnection(
  process.env.MONGODB_URI_EMPRISE_BATIE || localConnectionString,
  {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
)

empriseBatieConnection.catch((e) => {
  console.log(e)
})

const encadrementAddress1Connection = mongoose.createConnection(
  process.env.MONGODB_URI_ENCADREMENT_ADDRESS1 || localConnectionString,
  {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
)

encadrementAddress1Connection.catch((e) => {
  console.log(e)
})

const rentSchema = require('./rent.model')
const empriseBatieSchema = require('./emprisebatie.model')
const parisAddressSchema = require('./paris-address.model')
const lilleAddressSchema = require('./lille-address.model')
const plaineCommuneAddressSchema = require('./plaine_commune-address.model')

export const Rent = rentConnection.model('Rent', rentSchema)
export const EmpriseBatie = empriseBatieConnection.model(
  'Batie',
  empriseBatieSchema
)

export const ParisAddress = encadrementAddress1Connection.model(
  'parisaddress',
  parisAddressSchema
)

export const LilleAddress = encadrementAddress1Connection.model(
  'lilleaddress',
  lilleAddressSchema
)

export const PlaineCommuneAddress = encadrementAddress1Connection.model(
  'plainecommuneaddress',
  plaineCommuneAddressSchema
)
