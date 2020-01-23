const mongoose = require('mongoose')
const connectionString = "mongodb+srv://aymericdo:aRSZKUtqay0iU2Ou@emprisegeojson-amjem.mongodb.net/emprisebaties?retryWrites=true&w=majority"
mongoose.connect(connectionString, { useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true })
mongoose.Promise = global.Promise

module.exports = {
    EmpriseBatie: require('./db/emprisebatie.model'),
}
