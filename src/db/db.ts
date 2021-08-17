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

const empriseBatieConnection = mongoose.createConnection(
  process.env.MONGODB_URI_EMPRISE_BATIE || localConnectionString,
  {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
)

const encadrementAddress1Connection = mongoose.createConnection(
  process.env.MONGODB_URI_ENCADREMENT_ADDRESS1 || localConnectionString,
  {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
)

const rentSchema = require('./rent.model')
const empriseBatieSchema = require('./emprisebatie.model')
const parisAddressSchema = require('./paris-address.model')

export const Rent = rentConnection.model('Rent', rentSchema)
export const EmpriseBatie = empriseBatieConnection.model(
  'Batie',
  empriseBatieSchema
)
export const ParisAddress = encadrementAddress1Connection.model(
  'parisaddress',
  parisAddressSchema
)
