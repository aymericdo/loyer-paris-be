const config = require('./config.json')
const mongoose = require('mongoose')
mongoose.connect(process.env.MONGODB_URI || config.connectionString, { useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true })
mongoose.Promise = global.Promise

module.exports = {
    Rent: require('./db/rent.model'),
}