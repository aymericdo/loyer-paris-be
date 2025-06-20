/* eslint-disable no-undef */

import fs from 'fs'
import path from 'path'
import inquirer from 'inquirer'

function normalizeConstructionDate(epoqueConstruction: string): string {
  const text = epoqueConstruction
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

  if (/1946.*1970/.test(text)) {
    return '1946-1970'
  } else if (/1971.*1990/.test(text)) {
    return '1971-1990'
  } else if (/1991.*2005/.test(text)) {
    return '1991-2005'
  } else if (/\b1946\b/.test(text)) {
    return 'avant 1946'
  } else if (/\b1990\b/.test(text)) {
    return 'apres 1990'
  } else if (/\b2005\b/.test(text)) {
    return 'apres 2005'
  } else {
    return ''
  }
}

function normalizeNombrePieces(nombrePieces: string): string {
  const result = nombrePieces.match(/\b([1-3]P|4P\+)/)
  if (result) {
    return result[1]
  }

  return ''
}

async function editJsonData(
  data: Record<string, string>[],
): Promise<Record<string, string>[]> {
  return data
    .filter((element) => {
      return (
        element.Zone_calcul !== '' &&
        element.Type_habitat !== '' &&
        element.loyer_median !== ''
      )
    })
    .map((element) => {
      const match = element.Zone_calcul.split('.')

      const zone = match[2] || null

      return {
        Observatory: element.Observatory,
        Data_year: element.Data_year,
        agglomeration: element.agglomeration,
        zone: (+zone).toString(),
        Zone_calcul: element.Zone_calcul,
        Type_habitat: element.Type_habitat,
        epoque_construction_homogene: normalizeConstructionDate(
          element.epoque_construction_homogene,
        ),
        nombre_pieces_homogene: normalizeNombrePieces(
          element.nombre_pieces_homogene,
        ),
        loyer_median: element.loyer_median,
        loyer_median_max: (parseInt(element.loyer_median) * 1.2)
          .toFixed(2)
          .toString(), // +20%
        loyer_median_min: (parseInt(element.loyer_median) / 1.2)
          .toFixed(2)
          .toString(), // -20%
        nombre_observations: element.nombre_observations,
      }
    })
}

// === Convert CSV to JSON ===
async function csvToJsonData(
  csvString: string,
): Promise<Record<string, string>[]> {
  const lines = csvString.trim().split('\n')
  const headers = lines[0].split(';').map((h) => h.trim())

  const data = lines.slice(1).map((line) => {
    const values = line.split(';').map((v) => v.trim())
    const obj: Record<string, string> = {}

    headers.forEach((header, i) => {
      obj[header] = values[i] ?? ''
    })

    return obj
  })

  return data
}

// === Main Execution ===
async function main(fileName: string, city = null) {
  const currentCity = city
    ? city
    : (
        await inquirer.prompt([
          {
            type: 'input',
            name: 'city',
            message: 'Saisis le nom de la ville pour le nom final du fichier',
          },
        ])
      ).city

  const year = fileName.split('_')[2]

  const inputPath = path.resolve(__dirname, `./data/${fileName}.csv`)
  const outputPath = path.resolve(
    __dirname,
    `./data/json-data/encadrements_${currentCity}_${year}.json`,
  )

  const csvString = fs.readFileSync(inputPath, 'utf-8')
  let data = await csvToJsonData(csvString)
  data = await editJsonData(data)
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8')

  // eslint-disable-next-line no-console
  console.log(
    `✅ Fichier json généré à : ${outputPath} (à glisser dans json-data)`,
  )
  process.exit(0)
}

const DEFAULT_FILE_NAME = 'Base_OP_2023_L2B00'

const args = process.argv.slice(2) // ['csv="fileName"']
const csvArg = args.find((arg) => arg.startsWith('csv='))
const csvFile = csvArg?.split('=')[1]
const cityArg = args.find((arg) => arg.startsWith('city='))
const city = cityArg?.split('=')[1]

// eslint-disable-next-line no-console
console.log('csv received:', csvFile, 'city received:', city)

if (csvFile && !city) {
  process.exit(1)
}

main(csvFile ?? DEFAULT_FILE_NAME, city)
