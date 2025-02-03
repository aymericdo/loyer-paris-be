import { LogicimmoMapping } from '@interfaces/scrap-mapping'
import { virtualConsole } from '@services/helpers/jsdome'
import jsdom from 'jsdom'
const { JSDOM } = jsdom

export class LogicimmoScraping {
  static scrap(data: string): LogicimmoMapping {
    const { document } = new JSDOM(data, {
      virtualConsole: virtualConsole(),
    }).window

    const description = document.querySelector('#root > div > main > div.css-18xl464.MainColumn > div > section.Section.Description')
    const price = document.querySelector('[data-testid="aviv.CDP.Sections.Hardfacts.Price.Value"]')

    const cityLabel = document.querySelector('[data-testid="aviv.CDP.Sections.Location.Address"]')
    const renter = document.querySelector('[data-testid="aviv.CDP.Contacting.ContactCard.Title"]')
    const hasCharges = document.querySelector('[data-testid="aviv.CDP.Sections.Hardfacts.Price.Informations"]')
    const chargeNode = [...document.querySelectorAll('[data-testid="aviv.CDP.Sections.Price.PrimaryComponent"] .css-cxt05v')]

    let charges = null
    chargeNode.forEach((elem) => {
      if (elem.textContent.match(/Provisions pour charges/g)) {
        charges = elem.querySelector('.css-1djk842 .css-1thfuam')
      }
    })

    const itemTags = [
      ...document.querySelectorAll('[data-testid="aviv.CDP.Sections.Hardfacts.Price.Informations"] .css-1c3h18e'),
      ...document.querySelectorAll('[data-testid="aviv.CDP.Sections.Features"] ul[data-testid="aviv.CDP.Sections.Features.Preview"] li'),
    ]

    let furnished = null
    let surface = null
    let rooms = null

    itemTags.forEach((tag) => {
      if (tag.textContent.match(/m²/g)) {
        surface = tag
      } else if (tag.textContent.match(/pièce/g)) {
        rooms = tag
      } else if (tag.textContent.match(/meublé/g)) {
        furnished = tag
      }
    })

    if (!description && !price && !cityLabel) {
      return null
    }

    const dpe = document.querySelector('[data-testid="aviv.CDP.Sections.Energy.Preview.EfficiencyClass"]')

    return {
      id: null,
      cityLabel: cityLabel && cityLabel.textContent,
      hasCharges: hasCharges?.textContent === 'cc',
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
