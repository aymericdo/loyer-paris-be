/* eslint-disable no-undef */

import fs from 'fs'
import { DOMParser } from '@xmldom/xmldom'
import * as toGeoJSON from '@tmcw/togeojson'
import path from 'path'
import { fetchMoreCityInfo } from 'scripts/utils'

import type { Feature, FeatureCollection } from 'geojson'

const classicCityFilePath = 'src/services/city-config/classic-cities.json'
let data = null
try {
  data = fs.readFileSync(classicCityFilePath, 'utf8')
} catch (err) {
  console.error('Erreur lors de la lecture du fichier :', err)
  process.exit(1)
}

function stripLeadingZeros(value: string): string {
  return value.replace(/^0+(?=\d)/, '')
}

async function transformFeatureProperties(properties) {
  const raw = properties.VAR5 || ''
  const match = raw.match(/^(L\d{4})\.(\d{5})(?:\.(\d{2}))?$/)

  if (!match) return null

  const codeObservatoire = match[1]
  const codeInsee = match[2]
  let zone = match[3] || null

  const info = await fetchMoreCityInfo(codeInsee)
  const city = info?.nom || 'N/A'
  const postalCode = info?.codesPostaux?.[0] || 'N/A'

  if (!zone) {
    const currentCities = JSON.parse(data)
    const cityDetails = currentCities[city.toLowerCase()]

    const zoneStr = cityDetails?.zones[0]
    zone = zoneStr && typeof zoneStr === 'string' ? (zoneStr.match(/(?<=Zone ).*/) || [null])[0] : null
  }

  if (!zone) return null

  zone = stripLeadingZeros(zone)

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
async function main(fileName: string) {
  // === Configurable Paths ===

  const inputPath = path.resolve(__dirname, `./data/${fileName}.kml`)
  const outputPath = path.resolve(__dirname, `./data/${fileName}.json`)

  const kmlString = fs.readFileSync(inputPath, 'utf-8')
  const geojsonFeatures = await kmlToGeojson(kmlString)
  fs.writeFileSync(outputPath, geojsonFeatures, 'utf-8')

  // eslint-disable-next-line no-console
  console.log(`✅ Fichier GeoJSON à importer dans mongo généré à : ${outputPath}`)
  process.exit(0)
}

const DEFAULT_FILE_NAME = 'L2900_zone_elem_2024'

const args = process.argv.slice(2) // ['kmlFile="fileName"']
const cityArg = args.find(arg => arg.startsWith('kmlFile='))
const kmlFile = cityArg?.split('=')[1]

// eslint-disable-next-line no-console
console.log('kmlFile received:', kmlFile)

main(kmlFile ?? DEFAULT_FILE_NAME)
