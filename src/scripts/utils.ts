import axios from 'axios'

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
