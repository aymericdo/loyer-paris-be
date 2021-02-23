import { LogicimmoMapping } from "@interfaces/mapping"
import { virtualConsole } from '@helpers/jsdome';
import jsdom from 'jsdom'
const { JSDOM } = jsdom

export class LogicimmoScrapping {
  static scrap(data: string): LogicimmoMapping {
    const { document } = new JSDOM(data, { virtualConsole: virtualConsole() }).window

    const title = document.querySelector('h2.offerMainFeatures')
    const description = document.querySelector('div.offer-description-text')
    const price = document.querySelector('div.rightSide > .price > div')
    const charges = document.querySelector('#valueChargeRentProperty')
    const cityLabel = document.querySelector('[itemprop=address]')
    const renter = document.querySelector('div.agencyInfos div.agencyNameNoLogo')
    const hasCharges = charges && [...charges.parentNode.parentNode.parentNode.children]
        .some(text => text.textContent.includes('charges comprises'))

    const offerCriteria = [...document.querySelectorAll('div.offerCriteria > ul > li.listItem')]
    const itemTags = [...document.querySelectorAll('h2.offerMainFeatures > .feature')]

    let ref = null
    let furnished = null

    offerCriteria.forEach(criteria => {
        const label = criteria.querySelector('.label')
        const value = criteria.querySelector('.value').cloneNode(true)
        if (value && value.firstChild) {
            value.removeChild(value.firstChild)
        }
        if (label.textContent === 'Ref de l\'annonce') {
            ref = value
        } else if (label.textContent === 'Meublé') {
            furnished = value
        }
    })

    let surface = null
    let rooms = null

    itemTags.forEach(tag => {
        if (tag.textContent.match(/m²/g)) {
            surface = tag
        } else if (tag.textContent.match(/pièce/g)) {
            rooms = tag
        }
    })

    if (!title && !description && !price && !cityLabel) {
        return null
    }

    return {
        id: null,
        cityLabel: cityLabel && cityLabel.textContent,
        charges: charges && charges.textContent,
        hasCharges,
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
