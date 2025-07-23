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

    const title = document.querySelector(
      '[data-testid*="MainDescription.Title"]',
    )
    const description = document.querySelector(
      '[data-testid*="MainDescription.Expandable-text"]',
    )
    const price = document.querySelector(
      '[data-testid*="cdp-seo-wrapper"] .css-9wpf20',
    )
    const hasCharges = document.querySelector(
      '[data-testid*="cdp-seo-wrapper"] .css-3cq25l',
    )
    const cityLabel = document.querySelector(
      '[data-testid*="cdp-location-address"]',
    )
    const renter = document.querySelector('[data-testid*="ContactCard.Title"]')
    const chargesElement = document.querySelector(
      '[data-testid*="Sections.Price.PrimaryComponent"]',
    )

    const charges = chargesElement?.textContent?.match(
      /(?<=(pour charges.*))\d+/,
    )

    const itemTags = [
      ...document.querySelectorAll(
        '[data-testid*="cdp-seo-wrapper"] .css-7tj8u',
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
      charges: charges?.length ? charges[0] : null,
      description: description?.textContent,
      furnished,
      hasCharges: hasCharges?.textContent.includes('cc'),
      price: price?.textContent,
      renter: isParticulier ? PARTICULIER : renter ? renter.textContent : null,
      rooms: rooms?.textContent,
      surface: surface?.textContent,
      yearBuilt: yearBuilt?.textContent,
      title: title?.textContent,
      dpe: dpeElem?.textContent,
    }
  }
}
