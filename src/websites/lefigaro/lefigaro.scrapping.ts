import { virtualConsole } from '@helpers/jsdome'
import { LefigaroMapping } from '@interfaces/mapping'
import { ErrorCode } from '@services/api-errors'
import jsdom from 'jsdom'
const { JSDOM } = jsdom

export class LefigaroScrapping {
  static scrap(data: string): LefigaroMapping {
    const { document } = new JSDOM(data, {
      virtualConsole: virtualConsole(),
    }).window

    const title = document.querySelector('#contenu > .container-h1 > h1')

    const description = document.querySelector(
      'div.container-paragraph > p.description'
    )
    const price = document.querySelector('div.container-price span.price')
    const charges = document.querySelector('div.container-price span.charges')
    const hasCharges = document.querySelector(
      'div.container-price [title="Charges comprises"]'
    )
    const cityLabel = document.querySelector('#contenu > div > h1 > span')
    const renter = document.querySelector(
      'div.container-agency-infos > span.agency-name'
    )

    const features = [
      ...document.querySelectorAll(
        'div.container-features > ul.list-features > li'
      ),
    ]

    const hasMonthlyPriceElement = document.querySelector(
      'div.container-price > span.label'
    )
    const hasMonthlyPrice =
      hasMonthlyPriceElement &&
      hasMonthlyPriceElement.textContent === 'Prix mensuel'

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

    if (!title.textContent.includes('Location')) {
      throw { error: ErrorCode.Other, msg: `not a rent` }
    }

    if (!title || !hasMonthlyPrice) {
      return null
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
