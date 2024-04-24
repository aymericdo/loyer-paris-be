import mongoose from 'mongoose'

/*
Data are from https://adresse.data.gouv.fr/donnees-nationales
Request to keep only right city data
=> db.montpellieraddresses.deleteMany({ nom_commune: {$nin: [ 'Montpellier'] } })
=> db.montpellieraddresses.updateMany({}, [{ $set: { geometry: { type: 'Point', coordinates: [{ $toDouble: "$lon" }, { $toDouble: "$lat" }] } } }])
*/

const Schema = mongoose.Schema

const schema = new Schema({
  id: { type: String, required: true, unique: true },
  numero: { type: String, required: true },
  nom_voie: { type: String, required: true },
  code_postal: { type: String, required: true },
  code_insee: { type: String, required: true },
  nom_commune: { type: String, required: true },
  code_insee_ancienne_commune: { type: String },
  nom_ancienne_commune: { type: String, required: true },
  x: { type: String, required: true },
  y: { type: String, required: true },
  lon: { type: String, required: true },
  lat: { type: String, required: true },
  libelle_acheminement: { type: String, required: true },
  nom_afnor: { type: String, required: true },
  source_position: { type: String, required: true },
  source_nom_voie: { type: String, required: true },
})

schema.index(
  { nom_commune: 'text', nom_voie: 'text', numero: 'text' },
  {
    weights: {
      nom_commune: 10,
      nom_voie: 10,
      numero: 1,
    },
    default_language: 'french',
  }
)

schema.index(
  { nom_commune: 1, nom_voie: 1, numero: 1 },
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

schema.set('toJSON', { virtuals: true })

module.exports = schema
