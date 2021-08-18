import mongoose from 'mongoose'
import mongooseFuzzySearching from 'mongoose-fuzzy-searching'

const Schema = mongoose.Schema

const schema = new Schema({
  datasetid: { type: String, required: true },
  recordid: { type: String, required: true, unique: true },
  fields: { type: Object, required: true },
  geometry: { type: Object, required: true },
  properties: { type: Object, required: true },
  record_timestamp: { type: Date, required: true },
})

schema.plugin(mongooseFuzzySearching, {
  fields: ['fields.l_adr'],
  minSize: 3,
  weight: 10,
  prefixOnly: true,
})
schema.index({ geometry: '2dsphere' })

schema.set('toJSON', { virtuals: true })

module.exports = schema
