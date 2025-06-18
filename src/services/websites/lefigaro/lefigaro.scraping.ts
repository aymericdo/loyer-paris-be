import { LefigaroMapping } from '@interfaces/scrap-mapping'
import { ERROR_CODE } from '@services/api/errors'
import { virtualConsole } from '@services/helpers/jsdome'
import jsdom from 'jsdom'
const { JSDOM } = jsdom

export class LefigaroScraping {
  static scrap(data: string): LefigaroMapping {
    const { document } = new JSDOM(data, {
      virtualConsole: virtualConsole(),
    }).window

    const title = document.querySelector('#classified-main-infos')

    const description = document.querySelector('.classified-description > p')
    const price = document.querySelector('.classified-price')
    const charges = document.querySelector(
      'div.main-classified > div > div.classified-about-price > ul > li:nth-child(1) > span.about-price-fees-label',
    )
    const hasCharges = document.querySelector('.classified-price .fees')
    const cityLabel = title?.querySelector('span')
    const renter = document.querySelector(
      '#middle-inquiry > div.classifieds-about-agency > div > div.agency__desc > strong',
    )

    const features = [
      ...document.querySelectorAll(
        'div.main-classified > div > div.classified-features > ul.features-list > li .feature',
      ),
    ]

    let furnished = null
    let surface = null
    let rooms = null

    features.forEach((feature) => {
      if (feature.textContent.match(/m².*surface/g)) {
        surface = feature
      } else if (feature.textContent.match(/pièce/g)) {
        rooms = feature
      } else if (feature.textContent.match(/Meublé/g)) {
        furnished = feature
      }
    })

    const dpe = document.querySelector('div.container-dpe .dpe-list > .active')

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
      dpe: dpe?.textContent,
      furnished: furnished?.textContent,
      price: price && price.textContent,
      renter: renter && renter.textContent,
      rooms: rooms && rooms.textContent,
      surface: surface && surface.textContent,
      title: title && title.textContent,
    }
  }
}
