import { LuxResidenceMapping } from '@interfaces/mapping'
import { virtualConsole } from '@services/helpers/jsdome'
import jsdom from 'jsdom'
const { JSDOM } = jsdom

export class LuxResidenceScrapping {
  static scrap(data: string): LuxResidenceMapping {
    const { document } = new JSDOM(data, {
      virtualConsole: virtualConsole(),
    }).window

    const description = document.querySelector('#descriptionSection > div')
    const price = document.querySelector(
      '#appContainer > div > div > div > div > section.carouselImageContainer > section > div > span.price'
    )
    const renter = document.querySelector(
      '#appContainer > div > div > div > div > section.carouselImageContainer > section > div > span.agency > span.agencyName'
    )
    const cityLabel = document.querySelector(
      '#appContainer > div > div > div > div > section.carouselImageContainer > section > h1 > span.city'
    )
    const furnished = document.querySelector(
      '#detailsTab > div > div.detailsBlock.plus > ul > li.singleCriteria.furnished'
    )

    const features = Array.from(
      document.querySelectorAll(
        '#appContainer > div > div > div > div > section.carouselImageContainer > section > h1 > span.criteria > span'
      )
    )

    let surface = null
    let rooms = null

    features.forEach((feature) => {
      if (feature.textContent.match(/m2/g)) {
        surface = feature
      } else if (feature.textContent.match(/pièce/g)) {
        rooms = feature
      }
    })

    if (!description && !price && !cityLabel) {
      return null
    }

    return {
      id: null,
      cityLabel: cityLabel && cityLabel.textContent,
      description: description && description.textContent,
      furnished: furnished && !!furnished.textContent,
      price: price && price.textContent,
      renter: renter && renter.textContent,
      rooms: rooms && rooms.textContent,
      surface: surface && surface.textContent,
    }
  }
}
