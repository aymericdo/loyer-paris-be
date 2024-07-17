import { FonciaMapping } from '@interfaces/scrap-mapping'
import { virtualConsole } from '@services/helpers/jsdome'
import jsdom from 'jsdom'
const { JSDOM } = jsdom

export class FonciaScrapping {
  static scrap(data: string): FonciaMapping {
    const { document } = new JSDOM(data, {
      virtualConsole: virtualConsole(),
    }).window

    const main = document.querySelector('.infos .main')
    const title = main.querySelector('.section-title')
    const description = main.querySelector('.section-description')
    const secondary = document.querySelector('.infos .secondary')
    const price = secondary.querySelector('.price .price-value')

    const cityLabel = secondary.querySelector('.location')
    const address = secondary.querySelector('.location')
    let surface = secondary.querySelector('.main-features .surface')

    const dpeImg = document.querySelector('.dpe-diagnostic > img')
    const dpeMatches = dpeImg?.alt?.match(/(?<=Diagnostic classe énergie : )[ABCDEFG]/g)
    const dpe = dpeMatches?.length ? dpeMatches[0] : null

    let charges = null
    let rooms = null
    const features = [...document.querySelectorAll('.features-container .features .feature')]
    features.forEach((feature) => {
      if (feature.textContent?.match(/Dont provision sur charges/g)) {
        charges = feature.querySelector('span.feature-value')
      } else if (feature.textContent?.match(/Nombre de pièces/g)) {
        rooms = feature.querySelector('span.feature-value')
      } else if (!surface && feature.textContent?.match(/Surface habitable/g)) {
        surface = feature.querySelector('span.feature-value')
      }
    })

    if (!title && !description && !price && !cityLabel) {
      return null
    }

    return {
      id: null,
      cityLabel: cityLabel?.textContent,
      description: description?.textContent,
      price: price?.textContent,
      hasCharges: !!price?.textContent?.toLowerCase().includes('cc'),
      charges: charges?.textContent,
      renter: 'foncia',
      rooms: rooms?.textContent,
      surface: surface?.textContent,
      title: title?.textContent,
      address: address?.textContent,
      dpe,
    }
  }
}
