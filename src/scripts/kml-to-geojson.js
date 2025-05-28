/* eslint-disable no-undef */

const fs = require('fs')
const path = require('path')
const { DOMParser } = require('@xmldom/xmldom')
const toGeoJSON = require('@tmcw/togeojson')
const axios = require('axios')

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
  const zone = match[3] || null

  if (!zone) return null

  const year = properties.VAR2 || null

  const info = await fetchCityInfo(codeInsee)
  const city = info?.nom || 'N/A'
  const postalCode = info?.codesPostaux?.[0] || 'N/A'

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
async function kmlToGeojson(kmlString) {
  const kmlDom = new DOMParser().parseFromString(kmlString, 'text/xml')
  const geojson = toGeoJSON.kml(kmlDom)

  // Extraire seulement les features
  let featuresArray = geojson.features || []

  // Modifier les properties si besoin
  let transformedFeatures = []

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
