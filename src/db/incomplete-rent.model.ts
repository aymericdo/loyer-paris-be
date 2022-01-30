import mongoose from 'mongoose'
const Schema = mongoose.Schema

const schema = new Schema({
  id: { type: String, required: true },
  website: { type: String, required: true },
  url: { type: String, required: true },
  errorType: { type: String, required: true },
  errorMessage: { type: String, required: true },
  city: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
})

schema.index({ id: 1, website: 1 }, { unique: true })

schema.set('toJSON', { virtuals: true })

module.exports = schema
