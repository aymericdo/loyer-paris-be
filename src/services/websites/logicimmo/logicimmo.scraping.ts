// Same as seloger.scraping

import { LogicimmoMapping } from '@interfaces/scrap-mapping'
import { virtualConsole } from '@services/helpers/jsdome'
import { PARTICULIER } from '@services/websites/website'
import jsdom from 'jsdom'
const { JSDOM } = jsdom

export class LogicimmoScraping {
  static scrap(data: string): LogicimmoMapping {
    const { document } = new JSDOM(data, {
      virtualConsole: virtualConsole(),
    }).window

    const title = document.querySelector(
      '[data-testid*="MainDescription.Title"]',
    )
    const description = document.querySelector(
      '[data-testid*="MainDescription.Expandable-text"]',
    )
    const price = document.querySelector(
      '[data-testid*="Hardfacts.Price.Value"]',
    )
    const hasCharges = document.querySelector(
      '[data-testid*="Hardfacts.Price.Informations"]',
    )
    const cityLabel = document.querySelector(
      '[data-testid*="cdp-location-address"]',
    )
    const renter = document.querySelector('[data-testid*="ContactCard.Title"]')
    const charges = document.querySelector(
      '[data-testid*="Sections.Price.PrimaryComponent"] .css-cxt05v',
    )

    const itemTags = [
      ...document.querySelectorAll(
        '[data-testid*="Sections.Hardfacts"] .css-1c3h18e',
      ),
    ]

    let isParticulier = false
    let surface = null
    let rooms = null

    itemTags.forEach((tag) => {
      if (tag.textContent.match(/m²/g) && !tag.textContent.match(/terrain/gi)) {
        surface = tag
      } else if (tag.textContent.match(/pièce/gi)) {
        rooms = tag
      } else if (tag.textContent.match(/Particulier/g)) {
        isParticulier = true
      }
    })

    const itemTags2 = [
      ...document.querySelectorAll(
        'ul li [data-testid*="Sections.Features.Feature"]',
      ),
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
      '[data-testid*="Energy.Preview.EfficiencyClass"]',
    )

    return {
      id: null,
      cityLabel: cityLabelText,
      charges: charges?.textContent,
      description: description?.textContent,
      furnished,
      hasCharges: hasCharges?.textContent.includes('cc'),
      price: price?.textContent,
      renter: isParticulier ? PARTICULIER : renter ? renter.textContent : null,
      rooms: rooms?.textContent,
      surface: surface?.textContent,
      title: title?.textContent,
      dpe: dpeElem?.textContent,
    }
  }
}
