import { OrpiMapping } from '@interfaces/scrap-mapping'
import { virtualConsole } from '@services/helpers/jsdome'
import jsdom from 'jsdom'
const { JSDOM } = jsdom

export class OrpiScraping {
  static scrap(data: string): OrpiMapping {
    const { document } = new JSDOM(data, {
      virtualConsole: virtualConsole(),
    }).window

    const titleElement = document.querySelector(
      'body > main > article > section > div > div > div > div > div > div h1',
    )

    const descriptionElement = document.querySelector(
      'body > main > article > section div.u-p',
    )

    const chargesElement = [
      ...document.querySelectorAll(
        'body > main > article > section:nth-child(1) > div > div > div.o-grid.o-grid--1\\@md.o-grid--1\\@sm > div.o-grid__col.o-grid__col--8 > div.o-grid.u-mt-sm-bis > div.o-grid__col.o-grid__col--12.o-grid__col--6\\@md.o-grid__col--6\\@md-plus.u-text-right\\@md.u-text-right\\@md-plus > ul > li',
      ),
    ]

    const hasChargesElement = [
      ...document.querySelectorAll(
        'body > main > article > section:nth-child(1) > div > div > div.o-grid.o-grid--1\\@md.o-grid--1\\@sm > div.o-grid__col.o-grid__col--8 > div.o-grid.u-mt-sm-bis > div.o-grid__col.o-grid__col--12.o-grid__col--6\\@md.o-grid__col--6\\@md-plus.u-text-right\\@md.u-text-right\\@md-plus > p:nth-child(2) > small',
      ),
    ]
    const cityElement = document.querySelector(
      '#estate-map > div > div > div.u-mt-xs\\@md-plus.u-mt-sm > div > h2',
    )
    const priceElement = document.querySelector(
      'body > main > article > section:nth-child(1) > div > div > div.o-grid.o-grid--1\\@md.o-grid--1\\@sm > div.o-grid__col.o-grid__col--8 > div.o-grid.u-mt-sm-bis > div > p > strong',
    )
    const charges = chargesElement.find(
      (element) => element.textContent.search('Provisions pour charges') !== -1,
    )
    const hasCharges = hasChargesElement.some((element) =>
      element.textContent?.toLowerCase().includes('charges comprises'),
    )

    const renter = document.querySelector(
      'body > main > article > section:nth-child(1) > div > div > div > div > aside > div > div > div > h3',
    )

    const dpe = document.querySelector('li.c-dpe__index--active')
    const dpeRegex = /([ABCDEFG])/
    let dpeText = null

    if (dpe?.textContent) {
      const matches = dpe?.textContent?.match(dpeRegex)
      dpeText = matches?.length && matches[0]
    }

    const features = [
      ...document.querySelectorAll('#collapse-details div ul.o-grid li'),
    ]

    let furnished = false
    let surface = null
    let rooms = null

    features.forEach((feature) => {
      if (
        feature.textContent.match(/Surface.*m²/g) &&
        !feature.textContent.toLowerCase().includes('balcon')
      ) {
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
