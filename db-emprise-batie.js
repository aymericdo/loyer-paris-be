const mongoose = require('mongoose')
const dbEmpriseBatieConnection = mongoose.createConnection(process.env.MONGODB_URI_EMPRISE_BATIE, { useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true })

const schema = require('./db/emprisebatie.model')

const EmpriseBatie = dbEmpriseBatieConnection.model('Batie', schema)

module.exports = {
    EmpriseBatie,
}
