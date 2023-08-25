import { LeboncoinMapping } from '@interfaces/mapping'
import { virtualConsole } from '@services/helpers/jsdome'
import jsdom from 'jsdom'
const { JSDOM } = jsdom

export class LeboncoinScrapping {
  static scrap(data: string): LeboncoinMapping {
    const { document } = new JSDOM(data, {
      virtualConsole: virtualConsole(),
    }).window

    const subject = document.querySelector('[data-qa-id=adview_title]')
    const body = document.querySelector('[data-qa-id=adview_description_container]')

    const price = document.querySelector('[data-qa-id=adview_price] > p')
    const renter = document.querySelector('#aside > section > div > div.eWhWEg')
    const hasCharges = document.querySelector('[data-qa-id=adview_price] > div > p.text-caption')
    const cityLabel = document.querySelector('#map > div > h2')

    const surface = document.querySelector(
      '#grid > article div div[data-qa-id=criteria_item_square] > div > div > span'
    )
    const rooms = document.querySelector('#grid > article div div[data-qa-id=criteria_item_rooms] > div > div > span')
    const furnished = document.querySelector(
      '#grid > article div div[data-qa-id=criteria_item_furnished] > div > div > span'
    )

    const dpe = document.querySelector('#grid > article div div[data-qa-id=criteria_item_energy_rate] .styles_active__2SvNh')

    if ((!subject && !body) || !price || !cityLabel) {
      return null
    }

    return {
      id: null,
      body: (body ? body.textContent : ''),
      hasCharges: hasCharges?.textContent === 'Charges comprises',
      cityLabel: cityLabel?.textContent,
      dpe: dpe?.textContent,
      furnished: furnished?.textContent,
      price: price?.textContent,
      renter: renter?.textContent,
      rooms: rooms?.textContent,
      subject: subject?.textContent,
      surface: surface?.textContent,
    }
  }
}
