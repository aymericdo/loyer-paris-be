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
    const price = document.querySelector('body > main > div > div.mainContent > div.offerDetailContainer > section > div > h1 > div > div.offerSummaryPricing > p')

    const cityLabel = document.querySelector('body > main > div > div.mainContent > div > section > div > h1 > div > div.offerSummaryDetails > p.locality')
    const renter = document.querySelector(
      'body > main > div > div.mainContent > div.offerDetailContainer > div.offerContactVertical > div.contactVerticalWrapper > div.cardTopInfos > div.infosContainer > div > span > span'
    )

    const chargeNode = [
      ...document.querySelectorAll(
        'body > main > div.pageContainer > div.mainContent > div.offerDetailContainer > section > div.aboutPriceBox .aboutPriceContainer ul.aboutPriceList > li'
      )
    ]

    const offerCriteria = [...document.querySelectorAll('#dtlTechniqueBox > li.dtlTechiqueItm')]
    const itemTags = [
      ...document.querySelectorAll(
        'body > main > div > div > div.offerDetailContainer > section > div > h1 > div > div.offerSummaryDetails > p'
      )
    ]

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

    const dpe = document.querySelector('article.DPE > ul > li > span[tabindex]')

    return {
      id: null,
      cityLabel: cityLabel && cityLabel.textContent,
      charges: charges && charges.textContent,
      description: description && description.textContent,
      dpe: dpe?.textContent,
      furnished: furnished && !!furnished.textContent,
      price: price && price.textContent,
      renter: renter && renter.textContent,
      rooms: rooms && rooms.textContent,
      surface: surface && surface.textContent,
    }
  }
}
