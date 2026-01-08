import { SelogerMapping } from '@interfaces/scrap-mapping'
import { virtualConsole } from '@services/helpers/jsdome'
import { PARTICULIER } from '@services/websites/website'
import jsdom from 'jsdom'
const { JSDOM } = jsdom

export class SelogerScraping {
  static scrap(data: string): SelogerMapping {
    const { document } = new JSDOM(data, {
      virtualConsole: virtualConsole(),
    }).window

    const title = document.querySelector('[data-testid*="cdp-hardfacts"]')
    const description = document.querySelector('.Section.Description')
    const price = title?.nextElementSibling
    const hasCharges = title?.nextElementSibling
    const cityLabel = document.querySelector(
      '[data-testid*="cdp-location-address"]',
    )
    const renter = document.querySelector('[data-testid*="ContactCard.Title"]')

    const priceElement = document.querySelector('#price')
    const chargesElement = priceElement?.nextElementSibling

    const charges = chargesElement?.textContent?.match(
      /(?<=(pour charges.*))\d+/,
    )

    const itemTags = document
      .querySelector('[data-testid*="cdp-hardfacts-keyfacts"]')
      .textContent?.split('•')
      .map((text: string) => text.trim())

    let isParticulier = false
    let surface = null
    let rooms = null

    itemTags.forEach((tag: string) => {
      if (tag.match(/m²/g) && !tag.match(/terrain/gi)) {
        surface = tag
      } else if (tag.match(/pièce/gi)) {
        rooms = tag
      } else if (tag.match(/Particulier/g)) {
        isParticulier = true
      }
    })

    const itemTags2 = [
      ...document.querySelectorAll('[data-testid*="cdp-features"] ul li'),
    ]

    const furnished = itemTags2?.some((el) => {
      return el.textContent.match(/^Meublé/g)
    })

    let yearBuilt = itemTags2?.find((el) => {
      return el.textContent.match(/^Année de construction/g)
    })

    const basicFeatures = [
      ...document.querySelectorAll('[data-testid="basic-features"] > div'),
    ]
    if (!yearBuilt) {
      yearBuilt = basicFeatures?.find((el) => {
        return el.textContent.match(/^Construit en/g)
      })
    }

    if (!title && !description && !price && !cityLabel) {
      return null
    }

    const cityLabelText = cityLabel && cityLabel.textContent

    const dpeElem = document.querySelector(
      '[data-testid*="cdp-preview-scale-highlighted"]',
    )

    return {
      id: null,
      cityLabel: cityLabelText,
      charges: charges?.length ? charges[0] : null,
      description: description?.textContent,
      furnished,
      hasCharges: hasCharges?.textContent.includes('charges comprises'),
      price: price?.textContent,
      renter: isParticulier ? PARTICULIER : renter ? renter.textContent : null,
      rooms,
      surface,
      yearBuilt: yearBuilt?.textContent,
      title: title?.textContent,
      dpe: dpeElem?.textContent,
    }
  }
}
