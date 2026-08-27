import { OrpiMapping } from '@interfaces/scrap-mapping'
import { virtualConsole } from '@services/helpers/jsdome'
import jsdom from 'jsdom'
const { JSDOM } = jsdom

export class OrpiScraping {
  static scrap(data: string): OrpiMapping {
    const { document } = new JSDOM(data, {
      virtualConsole: virtualConsole(),
    }).window

    const estate = document.querySelector('main article')
    const titleElement =
      estate?.querySelector('h1') ??
      document.querySelector(
        'body > main > article > section > div > div > div > div > div > div h1',
      )

    const descriptionElement =
      estate?.querySelector('.s-cms') ??
      document.querySelector('body > main > article > section div.u-p')

    const priceDetails = titleElement?.closest('.o-grid')

    const chargesElement = priceDetails
      ? [...priceDetails.querySelectorAll('ul li')]
      : [
          ...document.querySelectorAll(
            'body > main > article > section:nth-child(1) > div > div > div.o-grid.o-grid--1\\@md.o-grid--1\\@sm > div.o-grid__col.o-grid__col--8 > div.o-grid.u-mt-sm-bis > div.o-grid__col.o-grid__col--12.o-grid__col--6\\@md.o-grid__col--6\\@md-plus.u-text-right\\@md.u-text-right\\@md-plus > ul > li',
          ),
        ]

    const hasChargesElement = priceDetails
      ? [...priceDetails.querySelectorAll('small')]
      : [
          ...document.querySelectorAll(
            'body > main > article > section:nth-child(1) > div > div > div.o-grid.o-grid--1\\@md.o-grid--1\\@sm > div.o-grid__col.o-grid__col--8 > div.o-grid.u-mt-sm-bis > div.o-grid__col.o-grid__col--12.o-grid__col--6\\@md.o-grid__col--6\\@md-plus.u-text-right\\@md.u-text-right\\@md-plus > p:nth-child(2) > small',
          ),
        ]
    const cityElement =
      titleElement?.querySelector('.h5') ??
      document.querySelector(
        '#estate-map > div > div > div.u-mt-xs\\@md-plus.u-mt-sm > div > h2',
      )
    const priceElement =
      priceDetails?.querySelector('strong.h2, p > strong') ??
      document.querySelector(
        'body > main > article > section:nth-child(1) > div > div > div.o-grid.o-grid--1\\@md.o-grid--1\\@sm > div.o-grid__col.o-grid__col--8 > div.o-grid.u-mt-sm-bis > div > p > strong',
      )
    const charges = chargesElement.find(
      (element) => element.textContent.search('Provisions pour charges') !== -1,
    )
    const hasCharges = hasChargesElement.some((element) =>
      element.textContent?.toLowerCase().includes('charges comprises'),
    )

    const renter =
      estate?.querySelector('aside h3') ??
      document.querySelector(
        'body > main > article > section:nth-child(1) > div > div > div > div > aside > div > div > div > h3',
      )

    const dpe = document.querySelector('li.c-dpe__index--active')
    const dpeRegex = /([ABCDEFG])/
    let dpeText = null

    if (dpe?.textContent) {
      const matches = dpe?.textContent?.match(dpeRegex)
      dpeText = matches?.length && matches[0]
    }

    const features = [...document.querySelectorAll('#collapse-details li')]

    let furnished = false
    let surface = null
    let rooms = null

    features.forEach((feature) => {
      if (
        feature.textContent.match(/Surface.*m²/g) &&
        !feature.textContent.toLowerCase().includes('balcon')
      ) {
        surface = feature
      } else if (feature.textContent.match(/pièces?/i)) {
        rooms = feature
      } else if (feature.textContent.match(/Meublé/i)) {
        furnished = true
      }
    })

    furnished ||= chargesElement.some((element) =>
      element.textContent?.toLowerCase().includes('location meublée'),
    )

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
