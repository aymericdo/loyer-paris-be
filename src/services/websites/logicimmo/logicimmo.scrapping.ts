import { LogicimmoMapping } from '@interfaces/mapping'
import { virtualConsole } from '@services/helpers/jsdome'
import jsdom from 'jsdom'
const { JSDOM } = jsdom

export class LogicimmoScrapping {
  static scrap(data: string): LogicimmoMapping {
    const { document } = new JSDOM(data, {
      virtualConsole: virtualConsole(),
    }).window

    const description = document.querySelector(
      'body > main > div.pageContainer > div.mainContent > div.offerDetailContainer > section.offer-detail-view > div > div.blocDescrProperty > article > p.descrProperty'
    )
    const price = document.querySelector(
      'body > main > div.pageContainer > div.mainContent > div.offerDetailContainer > section.offer-detail-view > div.infosAnnounceBox > div > ul > li.infoPriceBox > span'
    )
    const cityLabel = document.querySelector(
      'body > main > div.pageContainer > div.mainContent > div.offerDetailContainer > section.offer-detail-view > div.infosAnnounceBox > div > div > h1 > div.addressBottomBlock > strong > em'
    )
    const renter = document.querySelector(
      'body > main > div.pageContainer > div.mainContent > div.offerDetailContainer > section.offerContactVertical > div.contactVerticalWrapper > div.cardTopInfos > div.infosContainer > div > span > span'
    )

    const chargeNode = Array.from(
      document.querySelectorAll(
        'body > main > div.pageContainer > div.mainContent > div.offerDetailContainer > section.offer-detail-view > section.aboutPriceBox > ul > ul > li.aboutPriceEl'
      )
    )

    const offerCriteria = Array.from(document.querySelectorAll('#dtlTechniqueBox > li.dtlTechiqueItm'))
    const itemTags = Array.from(
      document.querySelectorAll(
        'body > main > div.pageContainer > div.mainContent > div.offerDetailContainer > section.offer-detail-view > div.infosAnnounceBox > div > div > h1 > div.addressTopBlock > .propertyTypeInfos > em.feature'
      )
    )

    let charges = null
    chargeNode.forEach((elem) => {
      if (elem.textContent.match(/Charges Locatives/g)) {
        charges = elem
      }
    })

    let furnished = null
    offerCriteria.forEach((criteria) => {
      if (criteria.textContent.match(/Meublé/g)) {
        furnished = criteria
      }
    })

    let surface = null
    let rooms = null

    itemTags.forEach((tag) => {
      if (tag.textContent.match(/m²/g)) {
        surface = tag
      } else if (tag.textContent.match(/p./g)) {
        rooms = tag
      }
    })

    if (!description && !price && !cityLabel) {
      return null
    }

    return {
      id: null,
      cityLabel: cityLabel && cityLabel.textContent,
      charges: charges && charges.textContent,
      description: description && description.textContent,
      furnished: furnished && !!furnished.textContent,
      price: price && price.textContent,
      renter: renter && renter.textContent,
      rooms: rooms && rooms.textContent,
      surface: surface && surface.textContent,
    }
  }
}
