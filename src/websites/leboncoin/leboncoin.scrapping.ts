import { virtualConsole } from '@helpers/jsdome'
import { LeboncoinMapping } from '@interfaces/mapping'
import jsdom from 'jsdom'
const { JSDOM } = jsdom

export class LeboncoinScrapping {
  static scrap(data: string): LeboncoinMapping {
    const { document } = new JSDOM(data, {
      virtualConsole: virtualConsole(),
    }).window

    const subject = document.querySelector('[data-qa-id=adview_title]')
    const body = document.querySelector(
      '[data-qa-id=adview_description_container] > div > div > span'
    )
    const body2 = document.querySelector(
      '#grid > article > div > div > div > div > p'
    )

    const price = document.querySelector('[data-qa-id=adview_price] > span')
    const renter =
      document.querySelector(
        '#aside > section > div[data-qa-id=adview_contact_container] > div h2'
      ) ||
      document.querySelector(
        '#aside > section > div[data-qa-id=adview_contact_container] > div > div > div > a'
      )
    const isPro = document.querySelector(
      '#aside > section > div[data-qa-id=adview_contact_container] > div'
    )
    const hasCharges = document.querySelector(
      '#grid > article > section > div > div > div > div.styles_Price__1tlGj > div > p'
    )
    const cityLabel = document.querySelector('#map > div > h2')

    const surface = document.querySelector(
      '#grid > article div div[data-qa-id=criteria_item_square] > div > div > span'
    )
    const rooms = document.querySelector(
      '#grid > article div div[data-qa-id=criteria_item_rooms] > div > div > span'
    )
    const furnished = document.querySelector(
      '#grid > article div div[data-qa-id=criteria_item_furnished] > div > div > span'
    )

    if (!subject && !body && !body2 && !price && !cityLabel) {
      return null
    }

    return {
      id: null,
      body:
        (body ? body.textContent : '') + (body2 ? ' ' + body2.textContent : ''),
      hasCharges: hasCharges && hasCharges.textContent === 'Charges comprises',
      cityLabel: cityLabel && cityLabel.textContent,
      furnished: furnished && furnished.textContent,
      price: price && price.textContent,
      renter:
        renter &&
        isPro &&
        (!!isPro.textContent.toLowerCase().includes('siren') ||
          !!isPro.textContent.toLowerCase().includes('siret'))
          ? renter.textContent
          : null,
      rooms: rooms && rooms.textContent,
      subject: subject && subject.textContent,
      surface: surface && surface.textContent,
    }
  }
}
