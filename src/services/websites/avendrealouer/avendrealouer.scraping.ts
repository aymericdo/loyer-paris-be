import { AvendrealouerMapping } from '@interfaces/scrap-mapping'
import { virtualConsole } from '@services/helpers/jsdome'
import jsdom from 'jsdom'
const { JSDOM } = jsdom

export class AvendrealouerScraping {
  static scrap(data: string): AvendrealouerMapping {
    const window = new JSDOM(data, {
      virtualConsole: virtualConsole(),
    }).window
    const document = window.document

    const blocDetail = document.querySelector('#debutBlocDetail')
    const title = blocDetail?.querySelector('h1')
    const price = blocDetail?.querySelector('.dLJgUN')
    const cityLabel = blocDetail?.querySelector('.leBNzy')

    const blocPro = document.querySelector('#blocProfessional')
    const description = blocPro?.querySelector('p.hQNjCq')
    const renter = blocPro?.querySelector('.kryojw .leTyeh')

    // const dpe = [...document.querySelectorAll('#adview-energy-link > div')].find((a) => window.getComputedStyle(a, '::before').backgroundColor !== 'rgba(0, 0, 0, 0)')

    const features = blocDetail ? [...blocDetail.querySelectorAll('.bdszss div.iOPKLj')] : []
    const features2 = blocPro ? [...blocPro.querySelectorAll('ul > li')] : []

    let furnished = null
    let surface = null
    let rooms = null
    let yearBuilt = null

    features.forEach((feature) => {
      if (feature.textContent.match(/m²/g)) {
        surface = feature
      } else if (feature.textContent.match(/Pièce/g)) {
        rooms = feature
      } else if (feature.textContent.match(/Construction/g)) {
        yearBuilt = feature
      }
    })
    features2.forEach((feature) => {
      if (feature.textContent.match(/Meublé/g)) {
        furnished = true
      }
    })

    const blocPrice = document.querySelector('#blocPrice')
    const features3 = blocPrice ? [...blocPrice.querySelectorAll('p')] : []

    let charges = null
    features3.forEach((feature) => {
      if (feature.textContent.match(/Charges forfaitaires :/g)) {
        charges = feature.querySelector('span')
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
      hasCharges: !!price?.textContent?.includes('CC'),
      charges,
      renter: renter?.textContent,
      furnished: furnished?.textContent,
      rooms: rooms?.textContent,
      surface: surface?.textContent,
      title: title?.textContent,
      yearBuilt: yearBuilt?.textContent,
      // dpe: dpe?.textContent,
    }
  }
}
