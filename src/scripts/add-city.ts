/* eslint-disable no-undef */

import inquirer from 'inquirer'
import * as fs from 'fs'
import {
  fetchCityInfo,
  fetchMoreCityInfo,
  fetchObservatoiresDesLoyers,
  getBuiltYearRangeEnd,
  getCityByInsee,
  getHouse,
  getZonesByInsee,
  observatoireVerification,
  unzip,
} from 'scripts/utils'
import path from 'path'
import { exec as execCallback } from 'child_process'
import { promisify } from 'util'

const exec = promisify(execCallback)

async function runTransformBaseOpCsvToJsonScript(
  fileName: string,
  city: string,
) {
  try {
    const { stdout, stderr } = await exec(
      `npm run base-op-csv-to-json -- csv=${fileName} city=${city.replaceAll(' ', '-')}`,
    )

    if (stderr) {
      console.error('stderr:', stderr)
    }

    // eslint-disable-next-line no-console
    console.log('stdout:', stdout)
  } catch (error) {
    console.error("Erreur d'exécution :", error)
    process.exit(1)
  }
}

async function runKmlToGeojsonScript(fileName: string) {
  try {
    const { stdout, stderr } = await exec(
      `npm run kml-to-geojson -- kmlFile=${fileName}`,
    )

    if (stderr) {
      console.error('stderr:', stderr)
    }

    // eslint-disable-next-line no-console
    console.log('stdout:', stdout)
  } catch (error) {
    console.error("Erreur d'exécution :", error)
    process.exit(1)
  }
}

async function main() {
  const mainFilePath = 'src/services/city-config/main-cities.json'
  const classicCityFilePath = 'src/services/city-config/classic-cities.json'

  let data = null
  try {
    data = fs.readFileSync(mainFilePath, 'utf8')
  } catch (err) {
    console.error('Erreur lors de la lecture du fichier :', err)
    return
  }

  const currentMainCities = JSON.parse(data)

  const { mainCity } = await inquirer.prompt([
    {
      type: 'input',
      name: 'mainCity',
      message: 'Saisis le nom de la ville (mainCity) que tu veux ajouter',
    },
  ])

  if (Object.keys(currentMainCities).includes(mainCity)) {
    console.error('La ville existe déjà')
    // return
  }

  const infoFetched = await fetchCityInfo(mainCity)
  const feature = infoFetched.features[0]

  const departement = feature.properties.citycode.slice(0, 2)
  let observatoireData = null

  let ok = false
  let observatoireNumber = 0
  try {
    do {
      observatoireData = await fetchObservatoiresDesLoyers(
        departement,
        observatoireNumber.toString().padStart(2, '0'),
      )
      await unzip(observatoireData.year, observatoireData.observatoire)
      ok = await observatoireVerification(
        feature.properties.label,
        observatoireData.observatoire,
        observatoireData.year,
      )
      observatoireNumber += 1
    } while (!ok)
  } catch (error) {
    console.error("Problème au niveau de l'observatoire des loyers", error)
    return
  }

  const { observatoire, year } = observatoireData

  const cityByInsee = await getCityByInsee(observatoire, year)
  // eslint-disable-next-line no-console
  console.log(cityByInsee)
  const cityList = Object.values(cityByInsee)
  const zonesByInsee = await getZonesByInsee(observatoire, year)
  const house = await getHouse(observatoire, year)
  const builtYearRangeEnd = await getBuiltYearRangeEnd(observatoire, year)

  const cityDetailTmp = await inquirer.prompt([
    {
      type: 'input',
      name: 'label',
      message: 'Saisis le nom de la ville à afficher',
    },
    {
      type: 'confirm',
      name: 'notFake',
      message: `${mainCity} applique réellement l'encadrement ?`,
      default: true,
    },
  ])

  const mainCityDetail = {
    ...cityDetailTmp,
    cityList: cityList.map((city: string) => city.trim().toLowerCase()),
    fake: !cityDetailTmp.notFake,
    house,
    coordinates: feature.geometry.coordinates.reverse(),
    builtYearRangeEnd: builtYearRangeEnd ? 2005 : 1990,
  }

  delete mainCityDetail.notFake

  if (!mainCityDetail.fake) {
    mainCityDetail['infoLink'] = (
      await inquirer.prompt([
        {
          type: 'input',
          name: 'infoLink',
          message:
            "Saisis l'url de la ville qui regroupe les informations sur l'encadrement",
        },
      ])
    ).infoLink
  }

  // eslint-disable-next-line no-console
  console.log(mainCityDetail)

  try {
    fs.writeFileSync(
      mainFilePath,
      JSON.stringify(
        {
          ...currentMainCities,
          [mainCity]: mainCityDetail,
        },
        null,
        2,
      ),
      'utf8',
    )
  } catch (err) {
    console.error("Erreur lors de l'écriture dans le fichier :", err)
    return
  }

  try {
    data = fs.readFileSync(classicCityFilePath, 'utf8')
  } catch (err) {
    console.error('Erreur lors de la lecture du fichier :', err)
    return
  }

  const currentCities = JSON.parse(data)

  const newCities = {}

  for (const inseeCode of Object.keys(cityByInsee)) {
    const city = cityByInsee[inseeCode].toLowerCase()

    const moreInfoFetched = await fetchMoreCityInfo(inseeCode)

    const cityDetail = {
      inseeCode,
      label: moreInfoFetched.nom,
      postalCodes: moreInfoFetched.codesPostaux,
      zones: zonesByInsee[inseeCode].map((zone: string) => zone.trim()),
    }

    if (['paris', 'lyon', 'marseille'].includes(city)) {
      cityDetail['arrondissement'] = true
    }

    newCities[city] = { ...cityDetail }
  }

  // eslint-disable-next-line no-console
  console.log(newCities)

  try {
    fs.writeFileSync(
      classicCityFilePath,
      JSON.stringify(
        {
          ...currentCities,
          ...newCities,
        },
        null,
        2,
      ),
      'utf8',
    )
  } catch (err) {
    console.error("Erreur lors de l'écriture dans le fichier :", err)
    return
  }

  // eslint-disable-next-line no-console
  console.log(`✅ la ville "${mainCity}" a été ajoutée`)

  await runKmlToGeojsonScript(`L${observatoire}_zone_elem_${year}`)
  await runTransformBaseOpCsvToJsonScript(
    `Base_OP_${year}_L${observatoire}`,
    mainCity,
  )

  await fs.promises.unlink(
    path.resolve(__dirname, './data', `L${observatoire}_zone_elem_${year}.kml`),
  )
  await fs.promises.unlink(
    path.resolve(__dirname, './data', `L${observatoire}Zonage${year}.csv`),
  )
  await fs.promises.unlink(
    path.resolve(__dirname, './data', `Base_OP_${year}_L${observatoire}.csv`),
  )
}

main()
