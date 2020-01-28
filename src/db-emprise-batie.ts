import { connectionString } from './config'
const mongoose = require('mongoose')

const dbEmpriseBatieConnection = mongoose.createConnection(process.env.MONGODB_URI_EMPRISE_BATIE || connectionString, { useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true })

const schema = require('./db/emprisebatie.model')

export const EmpriseBatie = dbEmpriseBatieConnection.model('Batie', schema)
