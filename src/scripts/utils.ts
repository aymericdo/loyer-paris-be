import axios from 'axios'
import fs from 'fs'
import path from 'path'
import AdmZip from 'adm-zip'
import csv from 'csv-parser'
import iconv from 'iconv-lite'

function normalizeHeader(header: string): string {
  return header
    .normalize('NFD') // supprime les accents
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/_/g, '')
    .toUpperCase()
    .trim()
}

export async function fetchCityInfo(city: string) {
  try {
    const response = await axios(
      `https://api-adresse.data.gouv.fr/search/?q=${city}&limit=1`,
    )
    return response.data
  } catch (error) {
    console.error(error)
  }
}

export async function fetchMoreCityInfo(inseeCode: string) {
  try {
    const response = await axios(
      `https://geo.api.gouv.fr/communes/${inseeCode}?fields=code,nom,codesPostaux`,
    )
    return response.data
  } catch (error) {
    console.error(error)
  }
}

export async function fetchObservatoiresDesLoyers(
  departement: string,
  observatoireNumber: string,
) {
  const observatoire = `${departement}${observatoireNumber}`

  let year = new Date().getFullYear()
  let data = null

  do {
    const fileName = `Base_OP_${year}_L${observatoire}.zip`
    const targetPath = path.resolve(__dirname, './data', fileName)
    try {
      const response = await axios(
        `https://www.observatoires-des-loyers.org/datagouv/${year}/Base_OP_${year}_L${observatoire}.zip`,
        { responseType: 'stream' },
      )
      data = response.data

      const writer = fs.createWriteStream(targetPath)
      response.data.pipe(writer)

      await new Promise<void>((resolve, reject) => {
        writer.on('finish', () => resolve())
        writer.on('error', reject)
      })
    } catch (error) {
      if (error.status === 404) {
        year -= 1
      } else {
        console.error(error)
      }
      if (year < 2020) throw 'no result'
    }
  } while (data === null)

  return { year: year.toString(), observatoire }
}

export async function unzip(year: string, observatoire: string) {
  const fileName = `Base_OP_${year}_L${observatoire}.zip`
  const zipPath = path.resolve(__dirname, './data', fileName)

  const outputDir = path.resolve(__dirname, 'data')

  const zip = new AdmZip(zipPath)

  const targetFiles = [
    `L${observatoire}_zone_elem_${year}.kml`,
    `L${observatoire}Zonage${year}.csv`,
    `Base_OP_${year}_L${observatoire}.csv`,
  ]

  for (const entry of zip.getEntries()) {
    if (targetFiles.includes(entry.entryName)) {
      const outputPath = path.join(outputDir, entry.entryName)
      fs.mkdirSync(path.dirname(outputPath), { recursive: true })
      const content = iconv.decode(entry.getData(), 'latin1')
      fs.writeFileSync(outputPath, content, { encoding: 'utf8' })

      // eslint-disable-next-line no-console
      console.log(`✅ Fichier extrait : ${entry.entryName}`)
    }
  }

  await fs.promises.unlink(zipPath)
}

export async function observatoireVerification(
  mainCity: string,
  observatoire: string,
  year: string,
): Promise<boolean> {
  const filePath = path.resolve(
    __dirname,
    './data',
    `L${observatoire}Zonage${year}.csv`,
  )

  if (!fs.existsSync(filePath)) {
    throw new Error(`Le fichier ${filePath} n'existe pas.`)
  }

  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(filePath, { encoding: 'utf8' })
    let cityColumnName: string | undefined
    let resolved = false

    stream
      .pipe(
        csv({
          separator: ';',
          mapHeaders: ({ header }) => normalizeHeader(header),
        }),
      )
      .on('headers', (headers) => {
        for (const rawHeader of headers) {
          if (normalizeHeader(rawHeader) === 'LIBCOM') {
            cityColumnName = rawHeader
            break
          }
        }

        if (!cityColumnName) {
          resolved = true
          return reject(
            new Error(
              `Aucune colonne ville trouvée dans : ${headers.join(', ')}`,
            ),
          )
        }
      })
      .on('data', (row) => {
        if (!cityColumnName || resolved) return
        const city = row[cityColumnName]?.trim()
        if (
          normalizeHeader(city?.toLowerCase()).includes(
            normalizeHeader(mainCity.toLowerCase()),
          )
        ) {
          stream.destroy()
          return resolve(true)
        }
      })
      .on('end', () => {
        if (!resolved) {
          resolve(false)
        }
      })
      .on('close', () => {
        if (!resolved) {
          resolve(false)
        }
      })
      .on('error', (err) => {
        if (!resolved) {
          reject(err)
        }
      })
  })
}

export async function readCityList(
  observatoire: string,
  year: string,
): Promise<string[]> {
  const filePath = path.resolve(
    __dirname,
    './data',
    `L${observatoire}Zonage${year}.csv`,
  )

  if (!fs.existsSync(filePath)) {
    throw new Error(`Le fichier ${filePath} n'existe pas.`)
  }

  return new Promise((resolve, reject) => {
    const cities = new Set<string>()
    let cityColumnName: string | undefined

    fs.createReadStream(filePath, { encoding: 'utf8' })
      .pipe(
        csv({
          separator: ';',
          mapHeaders: ({ header }) => normalizeHeader(header),
        }),
      )
      .on('headers', (headers) => {
        for (const rawHeader of headers) {
          if (normalizeHeader(rawHeader) === 'LIBCOM') {
            cityColumnName = normalizeHeader(rawHeader)
            break
          }
        }

        if (!cityColumnName) {
          return reject(
            new Error(
              `Aucune colonne "LIBCOM" détectée parmi : ${headers.join(', ')}`,
            ),
          )
        }
      })
      .on('data', (row) => {
        if (!cityColumnName) return
        const city = row[cityColumnName]?.trim()
        if (city) {
          cities.add(city)
        }
      })
      .on('end', () =>
        resolve(Array.from(cities).sort((a, b) => a.localeCompare(b))),
      )
      .on('error', reject)
  })
}

export async function getCityByInsee(
  observatoire: string,
  year: string,
): Promise<{ [city: string]: string }> {
  const filePath = path.resolve(
    __dirname,
    './data',
    `L${observatoire}Zonage${year}.csv`,
  )

  if (!fs.existsSync(filePath)) {
    throw new Error(`Le fichier ${filePath} n'existe pas.`)
  }

  return new Promise((resolve, reject) => {
    const result: { [inseeCode: string]: string } = {}
    let inseeColumnName: string | undefined
    let cityColumnName: string | undefined

    fs.createReadStream(filePath, { encoding: 'utf8' })
      .pipe(
        csv({
          separator: ';',
          mapHeaders: ({ header }) => normalizeHeader(header),
        }),
      )
      .on('headers', (headers) => {
        for (const rawHeader of headers) {
          const normalized = normalizeHeader(rawHeader)
          if (
            normalized === 'INSEE' ||
            normalized === 'COMMUNE' ||
            normalized === 'CODEINSEE'
          ) {
            inseeColumnName = normalized
          }
          if (normalized === 'LIBCOM') {
            cityColumnName = normalized
          }
        }

        if (!inseeColumnName || !cityColumnName) {
          return reject(
            new Error(
              `Colonnes requises manquantes. Trouvées : ${headers.join(', ')}`,
            ),
          )
        }
      })
      .on('data', (row) => {
        if (!inseeColumnName || !cityColumnName) return
        const inseeCode = row[inseeColumnName]?.trim()
        const city: string = row[cityColumnName]?.trim()

        if (inseeCode && city) {
          result[inseeCode] = city
        }
      })
      .on('end', () => {
        resolve(result)
      })
      .on('error', reject)
  })
}

export async function getZonesByInsee(
  observatoire: string,
  year: string,
): Promise<{ [city: string]: string[] }> {
  const filePath = path.resolve(
    __dirname,
    './data',
    `L${observatoire}Zonage${year}.csv`,
  )

  if (!fs.existsSync(filePath)) {
    throw new Error(`Le fichier ${filePath} n'existe pas.`)
  }

  return new Promise((resolve, reject) => {
    const result: { [city: string]: Set<string> } = {}
    let inseeColumnName: string | undefined
    let zoneColumnName: string | undefined

    fs.createReadStream(filePath, { encoding: 'utf8' })
      .pipe(
        csv({
          separator: ';',
          mapHeaders: ({ header }) => normalizeHeader(header),
        }),
      )
      .on('headers', (headers) => {
        for (const rawHeader of headers) {
          const normalized = normalizeHeader(rawHeader)
          if (
            normalized === 'INSEE' ||
            normalized === 'COMMUNE' ||
            normalized === 'CODEINSEE'
          ) {
            inseeColumnName = normalized
          }
          if (normalized === 'ZONE') {
            zoneColumnName = normalized
          }
        }

        if (!inseeColumnName || !zoneColumnName) {
          return reject(
            new Error(
              `Colonnes requises manquantes. Trouvées : ${headers.join(', ')}`,
            ),
          )
        }
      })
      .on('data', (row) => {
        if (!inseeColumnName || !zoneColumnName) return
        const inseeCode = row[inseeColumnName]?.trim()
        const zone = `Zone ${parseInt(row[zoneColumnName])}`

        if (inseeCode && zone) {
          if (!result[inseeCode]) {
            result[inseeCode] = new Set()
          }
          result[inseeCode].add(zone)
        }
      })
      .on('end', () => {
        // Convertir les Sets en tableaux
        const finalResult: { [inseeCode: string]: string[] } = {}
        for (const inseeCode in result) {
          finalResult[inseeCode] = Array.from(result[inseeCode]).sort((a, b) =>
            a.localeCompare(b),
          )
        }
        resolve(finalResult)
      })
      .on('error', reject)
  })
}

export async function getHouse(
  observatoire: string,
  year: string,
): Promise<boolean> {
  const filePath = path.resolve(
    __dirname,
    './data',
    `Base_OP_${year}_L${observatoire}.csv`,
  )

  if (!fs.existsSync(filePath)) {
    throw new Error(`Le fichier ${filePath} n'existe pas.`)
  }

  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(filePath, { encoding: 'utf8' })

    stream
      .pipe(
        csv({
          separator: ';',
          mapHeaders: ({ header }) => normalizeHeader(header),
        }),
      )
      .on('data', (row) => {
        if (row.TYPEHABITAT === 'Maison') {
          stream.destroy()
          return resolve(true)
        }
      })
      .on('end', () => {
        resolve(false)
      })
      .on('error', reject)
  })
}

export async function getBuiltYearRangeEnd(
  observatoire: string,
  year: string,
): Promise<boolean> {
  const filePath = path.resolve(
    __dirname,
    './data',
    `Base_OP_${year}_L${observatoire}.csv`,
  )

  if (!fs.existsSync(filePath)) {
    throw new Error(`Le fichier ${filePath} n'existe pas.`)
  }

  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(filePath, { encoding: 'utf8' })

    stream
      .pipe(
        csv({
          separator: ';',
          mapHeaders: ({ header }) => normalizeHeader(header),
        }),
      )
      .on('data', (row) => {
        if (row.EPOQUECONSTRUCTIONHOMOGENE.includes('2005')) {
          stream.destroy()
          return resolve(true)
        }
      })
      .on('end', () => {
        resolve(false)
      })
      .on('error', reject)
  })
}
