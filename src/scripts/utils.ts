import axios from 'axios'
import fs from 'fs'
import path from 'path'
import AdmZip from 'adm-zip'

export async function fetchCityInfo(city: string) {
  try {
    const response = await axios(`https://api-adresse.data.gouv.fr/search/?q=${city}&limit=1`)
    return response.data
  } catch (error) {
    console.error(error)
  }
}

export async function fetchMoreCityInfo(inseeCode: string) {
  try {
    const response = await axios(`https://geo.api.gouv.fr/communes/${inseeCode}?fields=code,nom,codesPostaux`)
    return response.data
  } catch (error) {
    console.error(error)
  }
}

export async function fetchObservatoiresDesLoyers(observatoire: string) {
  let year = new Date().getFullYear()
  let data = null

  do {
    const fileName = `Base_OP_${year}_L${observatoire}.zip`
    const targetPath = path.resolve(__dirname, './data', fileName)
    try {
      const response = await axios(`https://www.observatoires-des-loyers.org/datagouv/${year}/Base_OP_${year}_L${observatoire}.zip`, { responseType: 'stream' })
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
    }
  } while (data === null)

  return { year: year.toString(), observatoire }
}

export async function unzip(year: string, observatoire: string) {
  const fileName = `Base_OP_${year}_L${observatoire}.zip`
  const zipPath = path.resolve(__dirname, './data', fileName)

  const outputDir = path.resolve(__dirname, 'data')

  const zip = new AdmZip(zipPath)

  const targetFiles = [`L${observatoire}_zone_elem_${year}.kml`, `L${observatoire}Zonage${year}.csv`]

  for (const entry of zip.getEntries()) {
    if (targetFiles.includes(entry.entryName)) {
      const outputPath = path.join(outputDir, entry.entryName)
      fs.mkdirSync(path.dirname(outputPath), { recursive: true })
      fs.writeFileSync(outputPath, entry.getData())

      // eslint-disable-next-line no-console
      console.log(`✅ Fichier extrait : ${entry.entryName}`)
    }
  }

  await fs.promises.unlink(zipPath)
}
