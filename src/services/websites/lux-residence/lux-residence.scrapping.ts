import { LuxResidenceMapping } from '@interfaces/scrap-mapping'
import { virtualConsole } from '@services/helpers/jsdome'
import jsdom from 'jsdom'
const { JSDOM } = jsdom

export class LuxResidenceScrapping {
  static scrap(data: string): LuxResidenceMapping {
    const { document } = new JSDOM(data, {
      virtualConsole: virtualConsole(),
    }).window

    const description = document.querySelector('#descriptionSection')
    const price = document.querySelector('#appContainer > div div.informationSale > span.price')
    const renter = document.querySelector('#appContainer > div div.infosAgency > span.nameAgency')
    const cityLabel = document.querySelector('#appContainer > div .breadcrumb ul .last-level.breadCrumb-link')
    const surface = document.querySelector('#appContainer .informationProperty .criteria .singleCriteria.area')
    const rooms = document.querySelector('#appContainer .informationProperty .criteria .singleCriteria.nbrRoom')
    const dpe = document.querySelector('[data-testid="dpeClasseActive"]')

    const features = [
      ...document.querySelectorAll(
        '#appContainer .detailsBlock .listBlock > .listBlock-item'
      )
    ]

    let furnished = null
    let charges = null

    features.forEach((feature) => {
      if (feature.textContent.match(/Meublé/g)) {
        furnished = feature
      }
    })

    const priceFeatures = [
      ...document.querySelectorAll(
        '#appContainer .sc-1i8oomw-6.bxBoqJ'
      )
    ]

    priceFeatures.forEach((feature) => {
      if (feature.textContent.match(/Charges forfaitaires/g)) {
        charges = feature
      }
    })

    if (!description && !price && !cityLabel) {
      return null
    }

    return {
      id: null,
      cityLabel: cityLabel?.textContent,
      description: description?.textContent,
      furnished: furnished && !!furnished.textContent,
      price: price?.textContent,
      renter: renter?.textContent,
      rooms: rooms?.textContent,
      surface: surface?.textContent,
      dpe: dpe?.textContent,
      charges: charges?.textContent,
    }
  }
}
