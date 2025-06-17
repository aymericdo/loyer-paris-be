import { EstEnsembleDistrictItemProperties } from '@interfaces/est-ensemble'
import { ParisDistrictItemProperties } from '@interfaces/paris'
import { PlaineCommuneDistrictItemProperties } from '@interfaces/plaine-commune'
import mongoose from 'mongoose'

import { Document } from 'mongoose'

export interface ZoneProperties {
  city: string
  codeObservatoire: string
  codeInsee: string
  zone: string
  postalCode: string
  year: string
}

export interface ZoneDocument extends Document {
  type: string
  geometry: {
    type: 'MultiPolygon';
    coordinates: number[][][] } | { type: 'GeometryCollection', geometries: ZoneDocument }
  properties: ZoneProperties | PlaineCommuneDistrictItemProperties | EstEnsembleDistrictItemProperties | ParisDistrictItemProperties
}

const Schema = mongoose.Schema

const schema = new Schema({
  type: { type: String, required: true },
  geometry: { type: Object, required: true },
  properties: { type: Object, required: true },
})

schema.index({ geometry: '2dsphere' })

schema.set('toJSON', { virtuals: true })

export default schema
