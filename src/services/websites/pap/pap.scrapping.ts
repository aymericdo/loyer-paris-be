import { PapMapping } from '@interfaces/mapping'
import { ERROR_CODE } from '@services/api/errors'
import { virtualConsole } from '@services/helpers/jsdome'
import jsdom from 'jsdom'
const { JSDOM } = jsdom

export class PapScrapping {
  static scrap(data: string): PapMapping {
    const { document } = new JSDOM(data, {
      virtualConsole: virtualConsole(),
    }).window

    const title = document.querySelector('h1.item-title')
    const description = document.querySelector('.item-description > div > p')
    const price = document.querySelector('h1.item-title > span.item-price')
    const cityLabel = document.querySelector('div.item-description > h2')
    const itemTags = Array.from(document.querySelectorAll('.item-tags > li > strong'))
    const stations = Array.from(document.querySelectorAll('ul.item-transports > li > span.label'))

    const sectionName = document.querySelector(
      'body > div.details-annonce-container > div > div.main-content > div > ol > li:nth-child(2)'
    )

    let surface = null
    let rooms = null

    itemTags.forEach((tag) => {
      if (tag.textContent.match(/m²/g)) {
        surface = tag
      } else if (tag.textContent.match(/pièce/g)) {
        rooms = tag
      }
    })

    const dpe = document.querySelector('div.energy-indice > ul > li.active')

    if (!title) {
      return null
    }

    if (!sectionName || sectionName.textContent.trim() !== 'Location') {
      throw { error: ERROR_CODE.Other, msg: 'not a rent' }
    }

    return {
      id: null,
      cityLabel: cityLabel && cityLabel.textContent,
      description: description && description.textContent,
      dpe: dpe && dpe.textContent,
      price: price && price.textContent.replace('.', ''),
      rooms: rooms && rooms.textContent,
      stations: stations && stations.map((station) => station.textContent),
      surface: surface && surface.textContent,
      title: title && title.textContent,
    }
  }
}
