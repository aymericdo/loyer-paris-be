import { FnaimMapping } from '@interfaces/mapping'
import { ERROR_CODE } from '@services/api/errors'
import { virtualConsole } from '@services/helpers/jsdome'
import jsdom from 'jsdom'
const { JSDOM } = jsdom

export class FnaimScrapping {
  static scrap(data: string): FnaimMapping {
    const { document } = new JSDOM(data, {
      virtualConsole: virtualConsole(),
    }).window

    const tabs = [...document.querySelectorAll('#annonceFiche > div.ariane > span > a > span')]
    const title = document.querySelector('#annonceFiche > div.annonce_fiche.fiche > header > div > h1')
    const description = document.querySelector('#annonceFiche > div.annonce_fiche.fiche > div:nth-child(5) > p')
    const price = document.querySelector('#annonceFiche > div.annonce_fiche.fiche > header h3 > span')
    const chargesNode = document.querySelector('#annonceFiche > div.annonce_fiche.fiche > div.description > p')
    const hasCharges = document.querySelector('#annonceFiche > div.annonce_fiche.fiche > header > div.mainInfo > div')
    const renter = document.querySelector(
      '#annonceFiche > div.annonce_fiche.fiche > div.caracteristique.agence > div > div.coordonnees > div > a'
    )
    const cityLabel = document.querySelector('#annonceFiche > div.ariane')
    const features = [...document.querySelectorAll('#annonceFiche > div.annonce_fiche.fiche > ul > li')]
    const features2 = [...document.querySelectorAll('#logementBlock > ul > li')]

    let surface = null
    let rooms = null
    let yearBuilt = null

    let isRent = null
    tabs.forEach((tab) => {
      if (tab.textContent?.toLowerCase()?.match(/louer appartement/g)) {
        isRent = true
      }
    })

    if (!isRent) {
      throw { error: ERROR_CODE.Other, msg: 'not a rent' }
    }

    features.forEach((feature) => {
      if (feature.textContent.match(/m²/g)) {
        surface = feature
      } else if (feature.textContent.match(/Pièce/g)) {
        rooms = feature
      }
    })

    features2.forEach((feature) => {
      if (feature.textContent.match(/Année de construction/g)) {
        yearBuilt = feature
      }
    })

    if (!title && !description && !price && !cityLabel) {
      return null
    }

    const charges =
      chargesNode?.textContent?.match(/(?<=- )\d+(?= € par mois de provision pour charges)/g) &&
      chargesNode?.textContent?.match(/(?<=- )\d+(?= € par mois de provision pour charges)/g)[0]

    return {
      id: null,
      cityLabel: cityLabel?.textContent,
      description: description?.textContent,
      price: price?.textContent,
      hasCharges: !!hasCharges?.textContent?.toLowerCase().includes('charges comprises'),
      charges,
      renter: renter?.textContent,
      rooms: rooms?.textContent,
      yearBuilt: yearBuilt?.textContent,
      surface: surface?.textContent,
      title: title?.textContent,
    }
  }
}
