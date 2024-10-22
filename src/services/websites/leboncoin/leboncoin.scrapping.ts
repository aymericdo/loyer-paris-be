import { LeboncoinMapping } from '@interfaces/scrap-mapping'
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

    const price = document.querySelector('[data-qa-id=adview_price]')
    const renter = document.querySelector('#aside > section > div > [class*="profile"]')
    const hasCharges = document.querySelector('[data-qa-id=adview_price] > div p.text-caption')
    const cityLabel = document.querySelector('#grid > article > div:nth-child(2) > div > div > p')

    const surface = document.querySelector(
      '#grid > article div div[data-qa-id=criteria_item_square] > div > div div p'
    )
    const rooms = document.querySelector('#grid > article div div[data-qa-id=criteria_item_rooms] > div > div div p')
    const furnished = document.querySelector(
      '#grid > article div div[data-qa-id=criteria_item_furnished] > div > div div p'
    )
    const isHouse = document.querySelector(
      '#grid > article div div[data-qa-id=criteria_item_real_estate_type] > div > div div p'
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
      isHouse: isHouse?.textContent?.includes('Maison') || false,
    }
  }
}
