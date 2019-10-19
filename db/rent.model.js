const mongoose = require('mongoose')
const Schema = mongoose.Schema

const schema = new Schema({
    id: { type: String, required: true },
    website: { type: String, required: true },
    address: { type: String, required: false },
    postalCode: { type: String, required: false },
    longitude: { type: String, required: false },
    latitude: { type: String, required: false },
    hasFurniture: { type: Boolean, required: false },
    roomCount: { type: Number, required: false },
    yearBuilt: { type: Number, required: false },
    price: { type: Number, required: true },
    surface: { type: Number, required: true },
    maxPrice: { type: Number, required: true },
    isLegal: { type: Boolean, required: true },
    renter: { type: String, required: false },
    createdAt: { type: Date, default: Date.now }
})

schema.index({ id: 1, website: 1 }, { unique: true })

schema.set('toJSON', { virtuals: true })

module.exports = mongoose.model('Rent', schema)