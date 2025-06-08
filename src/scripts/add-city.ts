/* eslint-disable no-undef */

import inquirer from 'inquirer'
import * as fs from 'fs'
import { fetchCityInfo, fetchMoreCityInfo, fetchObservatoiresDesLoyers, unzip } from 'scripts/utils'

async function main() {
  const { year, observatoire } = await fetchObservatoiresDesLoyers('6300')
  await unzip(year, observatoire)

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

  const { mainCity } = await inquirer.prompt([{
    type: 'input',
    name: 'mainCity',
    message: 'Saisis le nom de la ville (mainCity) que tu veux ajouter',
  }])

  if (Object.keys(currentMainCities).includes(mainCity)) {
    console.error('La ville existe déjà')
    return
  }

  const cityDetailTmp = await inquirer.prompt([{
    type: 'input',
    name: 'cityList',
    message: `Saisis le nom des villes sous ${mainCity} (séparés d'une virgule)`,
  }, {
    type: 'input',
    name: 'label',
    message: 'Saisis le nom de la ville à afficher',
  }, {
    type: 'list',
    name: 'house',
    message: `Quel type de logement se trouve dans ${mainCity} ?`,
    choices: ['Appartement', 'Maison/Appartement'],
  }, {
    type: 'confirm',
    name: 'notFake',
    message: `${mainCity} applique réellement l'encadrement ?`,
    default: true,
  }])

  const infoFetched = await fetchCityInfo(cityDetailTmp.label)
  const feature = infoFetched.features[0]

  const mainCityDetail = {
    ...cityDetailTmp,
    cityList: cityDetailTmp.cityList.split(',').map((city: string) => city.trim()),
    fake: !cityDetailTmp.notFake,
    house: cityDetailTmp.house === 'Maison/Appartement',
    coordinates: feature.geometry.coordinates,
  }

  delete mainCityDetail.notFake

  if (!mainCityDetail.fake) {
    mainCityDetail['infoLink'] = (await inquirer.prompt([{
      type: 'input',
      name: 'infoLink',
      message: 'Saisis l\'url de la ville qui regroupe les informations sur l\'encadrement',
    }])).infoLink
  }

  // eslint-disable-next-line no-console
  console.log(mainCityDetail)

  try {
    fs.writeFileSync(mainFilePath, JSON.stringify({
      ...currentMainCities,
      [mainCity]: mainCityDetail,
    }, null, 2), 'utf8')
  } catch (err) {
    console.error('Erreur lors de l\'écriture dans le fichier :', err)
    return
  }

  // la
  // await fetchObservatoiresDesLoyers()

  try {
    data = fs.readFileSync(classicCityFilePath, 'utf8')
  } catch (err) {
    console.error('Erreur lors de la lecture du fichier :', err)
    return
  }

  const currentCities = JSON.parse(data)

  const newCities = {}

  for (let i = 0; i < mainCityDetail.cityList.length; ++i) {
    const city = mainCityDetail.cityList[i]
    const infoFetched = await fetchCityInfo(city)
    const feature = infoFetched.features[0]

    const inseeCode = feature.properties.citycode
    const moreInfoFetched = await fetchMoreCityInfo(inseeCode)

    const cityDetailTmp = await inquirer.prompt([{
      type: 'input',
      name: 'zones',
      message: `Saisis le nom des zones pour ${city} (séparés d'une virgule) (Zone xxx)`,
    }, {
      type: 'input',
      name: 'label',
      message: `Saisis le nom de la ville à afficher pour ${city}`,
    }])

    const cityDetail = {
      zones: cityDetailTmp.zones.split(',').map((zone: string) => zone.trim()),
      label: cityDetailTmp.label,
      postalCodes: moreInfoFetched.codesPostaux,
      inseeCode,
      arrondissement: ['paris', 'lyon', 'marseille'].includes(city),
    }

    newCities[city] = { ...cityDetail }
  }

  try {
    fs.writeFileSync(classicCityFilePath, JSON.stringify({
      ...currentCities,
      ...newCities,
    }, null, 2), 'utf8')
  } catch (err) {
    console.error('Erreur lors de l\'écriture dans le fichier :', err)
    return
  }

  // eslint-disable-next-line no-console
  console.log(`✅ la ville "${mainCity}" a été ajoutée`)
}

main()