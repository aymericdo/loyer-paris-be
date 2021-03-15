import { virtualConsole } from '@helpers/jsdome'
import { GensdeconfianceMapping } from '@interfaces/mapping'
import jsdom from 'jsdom'
import { particulierToken } from '../../helpers/particulier'
const { JSDOM } = jsdom

export class GensdeconfianceScrapping {
  static scrap(data: string): GensdeconfianceMapping {
    const { document } = new JSDOM(data, {
      virtualConsole: virtualConsole(),
    }).window

    const title = document.querySelector('#post-title')
    const description = document.querySelector('#ad-description')
    const price = document.querySelector(
      '#col-ad > div.price-table > div:nth-child(1) > div.price-table__value'
    )
    const charges = document.querySelector(
      '#col-ad > div.price-table > div:nth-child(2) > div.price-table__value'
    )
    const address = document.querySelector('#ad-address > p')
    const cityLabel = document.querySelector('#post-title-breadcrumb > small')
    const surface = document.querySelector('#ad-extra-fields-nb_square_meters')
    const renter = document.querySelector(
      '#post-title-badges > span.label.label-default.label-inverse.m-r.m-b-2sm'
    )

    if (!title) {
      return null
    }

    const cityLabelText =
      cityLabel &&
      cityLabel.textContent
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .split('—')[1]

    return {
      id: null,
      cityLabel: cityLabelText,
      address: address && address.textContent,
      charges: charges && charges.textContent,
      hasCharges:
        charges &&
        charges.textContent &&
        charges.textContent.match(/\d+/)[0] &&
        +charges.textContent.match(/\d+/)[0] > 0,
      description: description && description.textContent,
      // We don't save the real name of the pro, because we are very kind
      renter: renter && renter.textContent ? null : particulierToken,
      price: price && price.textContent,
      surface: surface && surface.textContent,
      title: title && title.textContent,
    }
  }
}
