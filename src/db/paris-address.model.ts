import mongoose from 'mongoose'

/*
Data are from https://opendata.paris.fr/explore/dataset/adresse_paris/information/
*/

const Schema = mongoose.Schema

const schema = new Schema({
  datasetid: { type: String, required: true },
  recordid: { type: String, required: true, unique: true },
  fields: { type: Object, required: true },
  geometry: { type: Object, required: true },
  properties: { type: Object, required: true },
  record_timestamp: { type: Date, required: true },
})

schema.index({ 'fields.l_adr': 'text' }, { default_language: 'french' })
schema.index(
  { 'fields.l_adr': 1 },
  {
    collation: {
      locale: 'fr',
      strength: 1,
      caseLevel: false,
      numericOrdering: true,
    },
  }
)
schema.index({ geometry: '2dsphere' })

module.exports = schema
