const mongoose = require('mongoose')
const Schema = mongoose.Schema

const schema = new Schema({
    OBJECTID: { type: Number, required: true, unique: true },
    geometry: { type: Object, required: true },
    properties: { type: Object, required: true },
})

schema.set('toJSON', { virtuals: true })

module.exports = mongoose.model('EmpriseBatie', schema)
