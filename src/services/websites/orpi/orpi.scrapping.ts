import { OrpiMapping } from '@interfaces/mapping'
import { virtualConsole } from '@services/helpers/jsdome'
import jsdom from 'jsdom'
const { JSDOM } = jsdom

export class OrpiScrapping {
  static scrap(data: string): OrpiMapping {
    const { document } = new JSDOM(data, {
      virtualConsole: virtualConsole(),
    }).window

    const dataDOM = document.querySelector('[data-component=estate-bookmark]')

    if (!dataDOM) return null

    const dataElement = JSON.parse((dataDOM as unknown as { dataset: { eulerianAction: string } }).dataset.eulerianAction)
    const description = document.querySelector('div.o-container > p')
    const chargesElement = Array.from(
      document.querySelectorAll('.o-grid > .o-grid__col .u-list-unstyled.u-text-xs > li')
    )
    const charges = chargesElement.find((element) => element.textContent.search('Provisions pour charges') !== -1)
    const hasChargesElement = document.querySelector('p.u-mt-n > span.u-h1')
    const hasCharges =
      hasChargesElement &&
      hasChargesElement.parentNode &&
      hasChargesElement.parentNode.textContent.includes('charges comprises')

    const dpe = document.querySelector('li.c-dpe__index--active')
    const dpeRegex = /([A-Z])/g
    let dpeText = null

    if (dpe && dpe.textContent) {
      dpeText = dpe.textContent.replace(dpeRegex, ' $1').trim()
    }

    return {
      id: dataElement.prdref,
      cityLabel: dataElement.nomVille,
      coord: {
        lng: dataElement.longitude,
        lat: dataElement.latitude,
      },
      charges: charges && charges.textContent,
      hasCharges,
      description: description && description.textContent,
      dpe: dpeText ?? null,
      furnished: !!dataElement.meuble,
      postalCode: dataElement.codePostal,
      price: dataElement.prdamount,
      renter: dataElement.agenceNom,
      rooms: dataElement.nbPieces,
      surface: dataElement.surfaceBien,
      title: dataElement.prdname.replace(/-/g, ' '),
      yearBuilt: dataElement.anneeConstruction,
    }
  }
}
