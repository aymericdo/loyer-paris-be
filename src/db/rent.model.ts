import mongoose from 'mongoose'
const Schema = mongoose.Schema

const schema = new Schema({
  id: { type: String, required: true },
  website: { type: String, required: true },
  isLegal: { type: Boolean, required: true },
  maxPrice: { type: Number, required: true },
  district: { type: String, required: true },
  price: { type: Number, required: true },
  priceExcludingCharges: { type: Number, required: true },
  surface: { type: Number, required: true },
  city: { type: String, required: true },
  url: { type: String, required: false },
  address: { type: String, required: false },
  postalCode: { type: String, required: false },
  longitude: { type: String, required: false },
  latitude: { type: String, required: false },
  hasFurniture: { type: Boolean, required: false },
  isHouse: { type: Boolean, required: false },
  roomCount: { type: Number, required: false },
  yearBuilt: { type: [Number], required: false, default: undefined },
  renter: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
  stations: { type: [String], required: false, default: undefined },
  dpe: { type: String, required: false },
  isFake: { type: Boolean, required: false },
})

schema.index({ id: 1, website: 1, priceExcludingCharges: 1 }, { unique: true })

schema.set('toJSON', { virtuals: true })

module.exports = schema
