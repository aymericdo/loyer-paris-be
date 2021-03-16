import { virtualConsole } from '@helpers/jsdome'
import { SuperimmoMapping } from '@interfaces/mapping'
import jsdom from 'jsdom'
const { JSDOM } = jsdom

export class SuperimmoScrapping {
  static scrap(data: string): SuperimmoMapping {
    const { document } = new JSDOM(data, {
      virtualConsole: virtualConsole(),
    }).window

    const title = document.querySelector(
      'body > main > div > div.content.fiche > header:nth-child(1) > h1'
    )
    const subtitle = document.querySelector(
      'body > main > div > div.content.fiche > p.resume'
    )
    const description = document.querySelector(
      'body > main > div > div.content.fiche > p.description'
    )
    const price = document.querySelector(
      'body > main > div > div.content.fiche > header:nth-child(1) > b > span'
    )
    const hasCharges = document.querySelector(
      'body > main > div > div.content.fiche > header:nth-child(1) > b > span'
    )
    const renter = document.querySelector(
      'body > main > div > div.content.fiche > div.row.section_lg > aside > div.block_agence > div > header > div.media-body'
    )
    const cityLabel = document.querySelector(
      'body > main > div > div.content.fiche > header:nth-child(1) > h1 > span'
    )
    const features = [
      ...document.querySelectorAll(
        'body > main > div > div.content.fiche > div.pictos > div.picto'
      ),
    ]
    const features2 = [
      ...document.querySelectorAll(
        'body > main > div > div.content.fiche > section > table > tbody > tr > td'
      ),
    ]

    let surface = null
    let rooms = null
    let charges = null
    let yearBuilt = null

    features.forEach((feature) => {
      if (feature.textContent.match(/m²/g)) {
        surface = feature
      } else if (feature.textContent.match(/pièce/g)) {
        rooms = feature
      }
    })

    features2.forEach((feature) => {
      if (feature.textContent.match(/Année de construction/g)) {
        yearBuilt = feature
      } else if (feature.textContent.match(/Charges/g)) {
        charges = feature
      }
    })

    if (!title && !description && !price && !cityLabel) {
      return null
    }

    return {
      id: null,
      cityLabel: cityLabel?.textContent,
      description: description?.textContent,
      charges: charges?.textContent,
      price: price?.textContent,
      hasCharges: !!hasCharges?.textContent?.includes("CC"),
      renter: renter?.textContent,
      rooms: rooms?.textContent,
      surface: surface?.textContent,
      yearBuilt: yearBuilt?.textContent,
      title: `${title?.textContent} ${subtitle?.textContent}`,
    }
  }
}
