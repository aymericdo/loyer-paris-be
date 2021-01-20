import mongoose from 'mongoose'
const Schema = mongoose.Schema

const schema = new Schema({
    id: { type: String, required: true },
    website: { type: String, required: true },
    address: { type: String, required: false },
    city: { type: String, required: false },
    postalCode: { type: String, required: false },
    longitude: { type: String, required: false },
    latitude: { type: String, required: false },
    hasFurniture: { type: Boolean, required: false },
    roomCount: { type: Number, required: false },
    yearBuilt: { type: [Number], required: false, default: undefined },
    price: { type: Number, required: false },
    priceExcludingCharges: { type: Number, required: false },
    surface: { type: Number, required: false },
    maxPrice: { type: Number, required: false },
    isLegal: { type: Boolean, required: false },
    renter: { type: String, required: false },
    createdAt: { type: Date, default: Date.now },
    stations: { type: [String], required: false, default: undefined },
})

schema.index({ id: 1, website: 1, priceExcludingCharges: 1 }, { unique: true })

schema.set('toJSON', { virtuals: true })

module.exports = schema
