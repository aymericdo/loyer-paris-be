import { SuperimmoMapping } from '@interfaces/mapping'
import { virtualConsole } from '@services/helpers/jsdome'
import jsdom from 'jsdom'
const { JSDOM } = jsdom

export class SuperimmoScrapping {
  static scrap(data: string): SuperimmoMapping {
    const { document } = new JSDOM(data, {
      virtualConsole: virtualConsole(),
    }).window

    const title = document.querySelector('body > main > div > div h1 > span')
    const description = document.querySelector('body > main > div.listing-show-wrapper > div.listing-content > p')

    const price = document.querySelector(
      'body > main > div.listing-show-wrapper > div.listing-content > section > table > tbody > tr:nth-child(1) > td:nth-child(1)'
    )
    const charges = document.querySelector(
      'body > main > div.listing-show-wrapper > div.listing-content > section > table > tbody > tr:nth-child(1) > td:nth-child(2)'
    )
    const renter = document.querySelector(
      'body > main > div.listing-show-wrapper > div.listing-top-content > div.agency-wrapper > div.agency-content > div.header-agency > div.agency-title'
    )

    const features = [
      ...document.querySelectorAll(
        'body > main > div.listing-show-wrapper > div.listing-top-content > div.gallery > div.listing-header > div > h1 .picto'
      )
    ]

    const cityLabel = features[features.length - 1]
    const features2 = [
      ...document.querySelectorAll(
        'body > main > div.listing-show-wrapper > div.listing-content > section:nth-child(8) > table > tbody > tr td'
      )
    ]

    let surface = null
    let rooms = null
    let yearBuilt = null

    features.forEach((feature) => {
      if (feature.textContent.match(/m²/g)) {
        surface = feature
      } else if (feature.textContent.match(/pièce/g)) {
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

    const dpe = document.querySelector('table.dpe-table > tbody > tr > td > table > tbody > tr.current')

    return {
      id: null,
      cityLabel: cityLabel?.textContent,
      description: description?.textContent,
      dpe: dpe?.textContent,
      charges: charges?.textContent,
      price: price?.textContent,
      hasCharges: !!price?.textContent?.includes('CC'),
      renter: renter?.textContent,
      rooms: rooms?.textContent,
      surface: surface?.textContent,
      yearBuilt: yearBuilt?.textContent,
      title: title?.textContent,
    }
  }
}
