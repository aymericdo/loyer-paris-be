import { LocserviceMapping } from '@interfaces/scrap-mapping'
import { virtualConsole } from '@services/helpers/jsdome'
import jsdom from 'jsdom'
const { JSDOM } = jsdom

export class LocserviceScraping {
  static scrap(data: string): LocserviceMapping {
    const { document } = new JSDOM(data, {
      virtualConsole: virtualConsole(),
    }).window

    const title = document.querySelector('#resume_titre > h2')

    const description = document.querySelector(
      '#descriptif_detail_left > div.innerDetail',
    )

    const price = document.querySelector('#resume_detail > ul > li.loyer')
    const furnished = document.querySelector('#resume_detail > ul > li.meuble')
    const surface = document.querySelector('#resume_detail > ul > li.surface')
    const cityLabel = document.querySelector('#YouAreThere')

    const dpe = document.querySelector(
      '#resume_detail > ul > li.dpe > div:nth-child(1) > span',
    )

    return {
      id: null,
      cityLabel: cityLabel && cityLabel.textContent,
      hasCharges: price?.textContent.includes('CC'),
      description: description?.textContent,
      dpe: dpe?.textContent,
      furnished: furnished?.textContent
        ?.toLowerCase()
        .replace(' ', '')
        .trim()
        .includes('louémeublé'),
      price: price && price.textContent.replace('.', ''),
      rooms:
        surface?.textContent?.match(/\d+ pièce/g) &&
        surface?.textContent?.match(/\d+ pièce/g)[0],
      surface:
        surface?.textContent?.match(/\d+ m²/g) &&
        surface?.textContent?.match(/\d+ m²/g)[0],
      title: title && title.textContent,
    }
  }
}
