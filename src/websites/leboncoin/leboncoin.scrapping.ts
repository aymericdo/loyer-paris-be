import { virtualConsole } from '@helpers/jsdome'
import { LeboncoinMapping } from '@interfaces/mapping'
import jsdom from 'jsdom'
import { ErrorCode } from '@services/api-errors'
const { JSDOM } = jsdom

export class LeboncoinScrapping {
  static scrap(data: string): LeboncoinMapping {
    const { document } = new JSDOM(data, {
      virtualConsole: virtualConsole(),
    }).window

    const subject = document.querySelector('[data-qa-id=adview_title]')
    const body = document.querySelector(
      '[data-qa-id=adview_description_container] > div > span'
    )
    const body2 = document.querySelector(
      '#grid > article > section > div.css-1eifrgn > div:nth-child(3) > div'
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
      '#aside > section > div[data-qa-id=adview_contact_container] > div > span'
    )
    const hasCharges = document.querySelector(
      '#grid > article > section > div.css-1eifrgn > div.css-rtde4j > div > div._2KqHw > p'
    )
    const cityLabel = document.querySelector(
      '#grid > article > div._3JOrc._1akwr._1mwQl.aj3_W.FB92D._3qvnf.PYBnx.rvrtO._23jKN._2hbpZ._1_1QY._1qvhT'
    )

    const surface = document.querySelector(
      '#grid > article div div[data-qa-id=criteria_item_square] > div > p._3eNLO._137P-.P4PEa._35DXM'
    )
    const rooms = document.querySelector(
      '#grid > article div div[data-qa-id=criteria_item_rooms] > div > p._3eNLO._137P-.P4PEa._35DXM'
    )
    const furnished = document.querySelector(
      '#grid > article div div[data-qa-id=criteria_item_furnished] > div > p._3eNLO._137P-.P4PEa._35DXM'
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
