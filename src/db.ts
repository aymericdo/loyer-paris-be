import { connectionString } from './config'
const mongoose = require('mongoose')

const dbConnection = mongoose.createConnection(process.env.MONGODB_URI || connectionString, { useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true })

const schema = require('./db/rent.model')

export const Rent = dbConnection.model('Rent', schema)
