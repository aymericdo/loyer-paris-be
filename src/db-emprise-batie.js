const mongoose = require('mongoose')
const config = require('./config.json')
const dbEmpriseBatieConnection = mongoose.createConnection(process.env.MONGODB_URI_EMPRISE_BATIE || config.connectionString, { useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true })

const schema = require('./db/emprisebatie.model')

const EmpriseBatie = dbEmpriseBatieConnection.model('Batie', schema)

module.exports = {
    EmpriseBatie,
}
