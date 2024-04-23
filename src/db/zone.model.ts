import mongoose from 'mongoose'
const Schema = mongoose.Schema

const schema = new Schema({
  _id: { type: Number, required: true, unique: true },
  type: { type: String, required: true },
  geometry: { type: Object, required: true },
  properties: { type: Object, required: true },
})

schema.index({ geometry: '2dsphere' })

schema.set('toJSON', { virtuals: true })

module.exports = schema
