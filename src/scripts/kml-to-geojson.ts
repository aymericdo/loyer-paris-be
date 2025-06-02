/* eslint-disable no-undef */

import fs from 'fs'
import { DOMParser } from '@xmldom/xmldom'
import * as toGeoJSON from '@tmcw/togeojson'
import { zones } from '@services/filters/city-filter/zones'
import path from 'path'
import axios from 'axios'

import type { Feature, FeatureCollection } from 'geojson'

// === Configurable Paths ===
const FILE_NAME = 'L7502_zone_elem_2024'

const inputPath = path.resolve(__dirname, `./data/${FILE_NAME}.kml`)
const outputPath = path.resolve(__dirname, `./data/${FILE_NAME}.json`)

async function fetchCityInfo(inseeCode) {
  try {
    const response = await axios(`https://geo.api.gouv.fr/communes/${inseeCode}?fields=code,nom,codesPostaux`)
    return response.data
  } catch (error) {
    console.error(error)
  }
}

async function transformFeatureProperties(properties) {
  const raw = properties.VAR5 || ''
  const match = raw.match(/^(L\d{4})\.(\d{5})(?:\.(\d{2}))?$/)

  if (!match) return null

  const codeObservatoire = match[1]
  const codeInsee = parseInt(match[2])
  let zone = match[3] || null

  const info = await fetchCityInfo(codeInsee)
  const city = info?.nom || 'N/A'
  const postalCode = info?.codesPostaux?.[0] || 'N/A'

  if (!zone) {
    const zoneStr = zones(city.toLowerCase())?.[0]
    zone = zoneStr ? (zoneStr.match(/(?<=Zone ).*/) || [null])[0] : null
  }

  if (!zone) return null

  const year = properties.VAR2 || null

  return {
    city,
    codeObservatoire,
    codeInsee,
    zone,
    postalCode,
    year,
  }
}

// === Convert KML to GeoJSON ===
async function kmlToGeojson(kmlString: string): Promise<string> {
  const kmlDom = new DOMParser().parseFromString(kmlString, 'text/xml')
  const geojson = toGeoJSON.kml(kmlDom) as FeatureCollection

  // Extraire seulement les features
  let featuresArray = geojson.features || []

  // Modifier les properties si besoin
  const transformedFeatures: Feature[] = []

  for (const feature of featuresArray) {
    const properties = await transformFeatureProperties(feature.properties)
    if (properties) {
      transformedFeatures.push({
        ...feature,
        properties,
      })
    }
  }

  featuresArray = await Promise.all(transformedFeatures)

  return JSON.stringify(featuresArray, null, 2)
}

// === Main Execution ===
async function main() {
  const kmlString = fs.readFileSync(inputPath, 'utf-8')
  const geojsonFeatures = await kmlToGeojson(kmlString)
  fs.writeFileSync(outputPath, geojsonFeatures, 'utf-8')

  // eslint-disable-next-line no-console
  console.log(`✅ Fichier GeoJSON généré à : ${outputPath}`)
}

main()
