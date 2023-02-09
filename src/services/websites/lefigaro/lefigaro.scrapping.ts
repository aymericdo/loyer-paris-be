import { LefigaroMapping } from '@interfaces/mapping'
import { ERROR_CODE } from '@services/api/errors'
import { virtualConsole } from '@services/helpers/jsdome'
import jsdom from 'jsdom'
const { JSDOM } = jsdom

export class LefigaroScrapping {
  static scrap(data: string): LefigaroMapping {
    const { document } = new JSDOM(data, {
      virtualConsole: virtualConsole(),
    }).window

    const title = document.querySelector('div.main-classified > div > section > h1#classified-main-infos')

    const description = document.querySelector('div.main-classified > div > section > div.classified-description > p')
    const price = document.querySelector('div.main-classified > div > section > div.classified-price')
    const charges = document.querySelector(
      'div.main-classified > div > div.classified-about-price > ul > li:nth-child(1) > span.about-price-fees-label'
    )
    const hasCharges = document.querySelector('div.main-classified > div > section > div.classified-price > span')
    const cityLabel = document.querySelector('div.main-classified > div > section > h1 > span')
    const renter = document.querySelector(
      '#middle-inquiry > div.classifieds-about-agency > div > div.agency__desc > strong'
    )

    const features = Array.from(
      document.querySelectorAll('div.main-classified > div > div.classified-features > ul.features-list > li .feature')
    )

    let furnished = null
    let surface = null
    let rooms = null

    features.forEach((feature) => {
      if (feature.textContent.match(/m²/g)) {
        surface = feature
      } else if (feature.textContent.match(/pièce/g)) {
        rooms = feature
      } else if (feature.textContent.match(/Meublé/g)) {
        furnished = feature
      }
    })

    if (!title) {
      return null
    }

    if (!title.textContent.includes('Location')) {
      throw { error: ERROR_CODE.Other, msg: 'not a rent' }
    }

    return {
      id: null,
      cityLabel: cityLabel && cityLabel.textContent,
      charges: charges && charges.textContent,
      hasCharges: hasCharges && !!hasCharges.textContent,
      description: description && description.textContent,
      furnished: furnished && furnished.textContent,
      price: price && price.textContent,
      renter: renter && renter.textContent,
      rooms: rooms && rooms.textContent,
      surface: surface && surface.textContent,
      title: title && title.textContent,
    }
  }
}
