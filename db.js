const config = require('./config.json')
const mongoose = require('mongoose')
const dbConnection = mongoose.createConnection(process.env.MONGODB_URI || config.connectionString, { useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true })

const schema = require('./db/rent.model')

const Rent = dbConnection.model('Rent', schema)

module.exports = {
    Rent,
}