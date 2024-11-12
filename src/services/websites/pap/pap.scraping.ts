import { PapMapping } from '@interfaces/scrap-mapping'
import { ERROR_CODE } from '@services/api/errors'
import { virtualConsole } from '@services/helpers/jsdome'
import { JSDOM } from 'jsdom'

export class PapScraping {
  static scrap(data: string): PapMapping {
    const { document } = new JSDOM(data, {
      virtualConsole: virtualConsole(),
    }).window

    const title = document.querySelector('h1.item-title')
    const description = document.querySelector('.item-description > div > p')
    const price = document.querySelector('h1.item-title > span.item-price')
    const cityLabel = document.querySelector('div.item-description > h2')
    const itemTags = [...document.querySelectorAll('.item-tags > li > strong')]
    const stations = [...document.querySelectorAll('ul.item-transports > li > span.label')]

    const sectionName = document.querySelector(
      'body > div.details-annonce-container > div > div.main-content > div > ol > li:nth-child(2)'
    )

    const rowPrices = [...document.querySelectorAll(
      'body > div.details-annonce-container > div > div.main-content .item-transports .row .col-1-3'
    )]

    let charges = null
    rowPrices.forEach((row) => {
      if (row.textContent.match(/Dont charges/g)) {
        charges = row
      }
    })

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
      cityLabel: cityLabel?.textContent,
      description: description?.textContent,
      dpe: dpe?.textContent,
      price: price?.textContent.replace('.', ''),
      charges: charges?.textContent,
      rooms: rooms?.textContent,
      stations: stations?.map((station) => station.textContent),
      surface: surface?.textContent,
      title: title?.textContent,
    }
  }
}
