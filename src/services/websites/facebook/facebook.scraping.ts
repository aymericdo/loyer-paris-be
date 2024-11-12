import { FacebookMapping } from '@interfaces/scrap-mapping'
import { ERROR_CODE } from '@services/api/errors'
import { virtualConsole } from '@services/helpers/jsdome'
import jsdom from 'jsdom'
const { JSDOM } = jsdom

export class FacebookScraping {
  static scrap(data: string): FacebookMapping {
    const { document } = new JSDOM(data, {
      virtualConsole: virtualConsole(),
    }).window

    const rightPanes = [...document.querySelectorAll('.xckqwgs.x26u7qi.x2j4hbs.x78zum5.xnp8db0.x5yr21d.x1n2onr6.xh8yej3.xzepove.x1stjdt1')]
    const rightPane = rightPanes[rightPanes.length - 1]

    if (!rightPane || (!rightPane.textContent.includes('Locations') && !rightPane.textContent.includes('Rentals'))) {
      throw { error: ERROR_CODE.Other, msg: 'not a rent' }
    }

    const title = rightPane.querySelector('h1')

    const description = rightPane.querySelector('.x1gslohp')
    const price = rightPane.querySelector('.x1anpbxc')

    const cityLabel = rightPane.querySelector('.xsag5q8 .x78zum5.xdt5ytf.xz62fqu.x16ldp7u .xu06os2.x1ok221b > span')

    const features = [
      ...rightPane.querySelectorAll(
        '.xwib8y2 .xjyslct'
      )
    ]

    let furnished = null
    let surface = null
    let rooms = null

    features.forEach((feature) => {
      if (feature.textContent.match(/(mètres carrés)|(square meters)/ig)) {
        surface = feature
      } else if (feature.textContent.match(/pièce|rooms/ig)) {
        rooms = feature
      } else if (feature.textContent.match(/Meublé/g)) {
        furnished = feature
      }
    })

    if (!title && !description && !price && !cityLabel) {
      return null
    }

    return {
      id: null,
      cityLabel: cityLabel && cityLabel.textContent,
      description: description && description.textContent,
      furnished: furnished?.textContent ? true : false,
      price: price && price.textContent,
      rooms: rooms && rooms.textContent,
      surface: surface && surface.textContent,
      title: title && title.textContent,
    }
  }
}
