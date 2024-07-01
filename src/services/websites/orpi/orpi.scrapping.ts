import { OrpiMapping } from '@interfaces/mapping'
import { virtualConsole } from '@services/helpers/jsdome'
import jsdom from 'jsdom'
const { JSDOM } = jsdom

export class OrpiScrapping {
  static scrap(data: string): OrpiMapping {
    const { document } = new JSDOM(data, {
      virtualConsole: virtualConsole(),
    }).window

    const titleElement = document.querySelector('body > main > article > div > div > div > div > div > div > div > div > div > h1')
    const descriptionElement = document.querySelector('div.o-container div.c-preview')
    const chargesElement = Array.from(
      document.querySelectorAll('.o-grid > .o-grid__col .u-list-unstyled.u-text-xs > li')
    )
    const hasChargesElement = Array.from(
      document.querySelectorAll('body > main > article > div > div > div > div > div > div > div > div > div > p > small')
    )
    const cityElement = document.querySelector('body > main > article > div > div > div > div > div > div > div > div > div > h1 > span')
    const priceElement = document.querySelector('body > main > article > div > div > div > div > div > div > div > div > div > p > strong')
    const charges = chargesElement.find((element) => element.textContent.search('Provisions pour charges') !== -1)
    const hasCharges = hasChargesElement.some((element) => element.textContent?.toLowerCase().includes('charges comprises'))
    const renter = document.querySelector('body > main > article > section > div > div > div > div > div > div > div > h3')

    const dpe = document.querySelector('li.c-dpe__index--active')
    const dpeRegex = /([ABCDEFG])/
    let dpeText = null

    if (dpe?.textContent) {
      const matches = dpe?.textContent?.match(dpeRegex)
      dpeText = matches?.length && matches[0]
    }

    const features = [...document.querySelectorAll('body > main > article > section > div > div > div > div > div > div > div > div > ul > li')]

    let furnished = false
    let surface = null
    let rooms = null

    features.forEach((feature) => {
      if (feature.textContent.match(/m²/g) && !feature.textContent.toLowerCase().includes('balcon')) {
        surface = feature
      } else if (feature.textContent.match(/pièce/g)) {
        rooms = feature
      } else if (feature.textContent.match(/Meublé/g)) {
        furnished = true
      }
    })

    return {
      id: null,
      cityLabel: cityElement?.textContent,
      charges: charges?.textContent,
      hasCharges,
      description: descriptionElement?.textContent,
      dpe: dpeText ?? null,
      furnished: furnished,
      price: priceElement?.textContent,
      renter: renter?.textContent,
      rooms: rooms?.textContent,
      surface: surface?.textContent,
      title: titleElement?.textContent,
    }
  }
}
