import { GensdeconfianceMapping } from '@interfaces/scrap-mapping'
import { virtualConsole } from '@services/helpers/jsdome'
import jsdom from 'jsdom'
const { JSDOM } = jsdom

export class GensdeconfianceScrapping {
  static scrap(data: string): GensdeconfianceMapping {
    const { document } = new JSDOM(data, {
      virtualConsole: virtualConsole(),
    }).window

    const isARent = document.querySelector('#post-title-breadcrumb > small')

    const title = document.querySelector('#post-title')
    const description = document.querySelector('#ad-description')
    const price = document.querySelector('#col-ad div.price-table > div:nth-child(1) > div.price-table__value')
    const charges = document.querySelector('#col-ad div.price-table > div:nth-child(2) > div.price-table__value')
    const address = document.querySelector('#ad-address > p')
    const cityLabel = document.querySelector('#post-title-breadcrumb > small')
    const itemTags = [...document.querySelectorAll('div > ul > li > div')]
    let surface = null

    itemTags.forEach((tag) => {
      if (tag.textContent.match(/m²|m2/g)) {
        surface = tag
      }
    })

    if (!title || !isARent?.textContent.includes('Locations immobilières')) {
      return null
    }

    const cityLabelText = cityLabel?.textContent
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .split('—')[1]

    return {
      id: null,
      cityLabel: cityLabelText,
      address: address?.textContent,
      charges: charges?.textContent,
      hasCharges:
        charges?.textContent && charges.textContent.match(/\d+/)[0] && +charges.textContent.match(/\d+/)[0] > 0,
      description: description?.textContent,
      price: price?.textContent,
      surface: surface?.textContent,
      title: title?.textContent,
    }
  }
}
