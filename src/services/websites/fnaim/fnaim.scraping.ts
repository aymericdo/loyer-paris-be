import { FnaimMapping } from '@interfaces/scrap-mapping'
import { ERROR_CODE } from '@services/api/errors'
import { virtualConsole } from '@services/helpers/jsdome'
import jsdom from 'jsdom'
const { JSDOM } = jsdom

export class FnaimScraping {
  static scrap(data: string): FnaimMapping {
    const { document } = new JSDOM(data, {
      virtualConsole: virtualConsole(),
    }).window

    const tabs = [...document.querySelectorAll('div.ariane > span > a > span')]
    const title = document.querySelector('#annonceFiche div > h1.titreFiche')
    const description = document.querySelector(
      '#annonceFiche [itemprop="description"]',
    )
    const price = document.querySelector('#annonceFiche div.annonce_price')
    const chargesNode = document.querySelector('#annonceFiche #description > p')
    const hasCharges = document.querySelector('#annonceFiche div.annonce_price')
    const renter = document.querySelector(
      '#colonneDroiteFiche div.caracteristique.agence .libelle',
    )
    const features = [
      ...document.querySelectorAll(
        '#annonceFiche div.caracteristique > ul > li',
      ),
    ]
    const dpe = document.querySelector('.dpeListe > li')
    const cityLabel = tabs.map((tab) => tab.textContent).join(' ')

    let surface = null
    let rooms = null
    let yearBuilt = null

    let isRent = null
    tabs.forEach((tab) => {
      if (
        tab.textContent
          ?.toLowerCase()
          ?.match(/(louer appartement)|(location appartement)/g)
      ) {
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
      } else if (feature.textContent.match(/Année de construction/g)) {
        yearBuilt = feature
      }
    })

    if (!title && !description && !price && !cityLabel) {
      return null
    }

    const chargeRegex = /(?<=- )\d+(?= € par mois de provision pour charges)/g
    const charges =
      chargesNode?.textContent?.match(chargeRegex) &&
      chargesNode?.textContent?.match(chargeRegex)[0]

    const dpeTextArray = dpe?.textContent
      .replace(/\s+/g, ' ')
      .replaceAll(' ', '')
      .replaceAll(' ', '')
      .replaceAll('\n', '')
      ?.match(/(?<=DPE:)[A-G]/g)

    return {
      id: null,
      cityLabel,
      description: description?.textContent,
      price: price?.textContent,
      hasCharges: !!hasCharges?.textContent
        ?.toLowerCase()
        .includes('charges comprises'),
      charges,
      renter: renter?.textContent,
      dpe: dpeTextArray?.length ? dpeTextArray[0] : null,
      rooms: rooms?.textContent,
      yearBuilt: yearBuilt?.textContent,
      surface: surface?.textContent,
      title: title?.textContent,
    }
  }
}
