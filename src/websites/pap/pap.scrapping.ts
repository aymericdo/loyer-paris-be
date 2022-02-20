import { virtualConsole } from '@helpers/jsdome'
import { PapMapping } from '@interfaces/mapping'
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
    const itemTags = [...document.querySelectorAll('.item-tags > li > strong')]
    const stations = [
      ...document.querySelectorAll('ul.item-transports > li > span.label'),
    ]

    const sectionName = document.querySelector(
      '[itemprop=itemListElement] > a[itemprop=item] > span[itemprop=name]'
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

    if (
      !sectionName ||
      sectionName.textContent.trim() !== 'Location Appartement' ||
      !title
    ) {
      return null
    }

    return {
      id: null,
      cityLabel: cityLabel && cityLabel.textContent,
      description: description && description.textContent,
      price: price && price.textContent.replace('.', ''),
      rooms: rooms && rooms.textContent,
      stations: stations && stations.map((station) => station.textContent),
      surface: surface && surface.textContent,
      title: title && title.textContent,
    }
  }
}
