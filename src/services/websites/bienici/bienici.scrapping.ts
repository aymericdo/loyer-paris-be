import { BienIciMapping } from '@interfaces/mapping'
import { virtualConsole } from '@services/helpers/jsdome'
import jsdom from 'jsdom'
const { JSDOM } = jsdom

export class BienIciScrapping {
  static scrap(data: string): BienIciMapping {
    const { document } = new JSDOM(data, {
      virtualConsole: virtualConsole(),
    }).window

    const title = document.querySelector(
      '[id^=section-detailed] > div > div.detailedSheetOtherInfo > div.detailedSheetFirstBlock > div.titleInside > h1'
    )
    const description = document.querySelector(
      '[id^=section-detailed] > div > div.detailedSheetOtherInfo > section.description'
    )
    const price = document.querySelector(
      '[id^=section-detailed] > div > div.detailedSheetOtherInfo > div.detailedSheetFirstBlock > div.titleInside > div.titleInsideTable > div.titleFirstBloc > div.detailedSheetPrice > div > div > span.ad-price__the-price'
    )
    const charges = document.querySelector(
      '[id^=section-detailed] > div > div.detailedSheetOtherInfo > div.detailedSheetFirstBlock > div.titleInside > div.titleInsideTable > div.titleFirstBloc > div.detailedSheetPrice div.ad-price__fees-infos'
    )
    const hasCharges = document.querySelector(
      '[id^=section-detailed] > div > div.detailedSheetOtherInfo > div.detailedSheetFirstBlock > div.titleInside > div.titleInsideTable > div.titleFirstBloc > div.detailedSheetPrice > div > div > span.perMonth'
    )
    const renter = document.querySelector(
      '#public > div.contactSection > div.contactToggleInfo.contactButton.scrollUp > div.contactToggleName > div.contact-name'
    )
    const cityLabel = document.querySelector(
      '[id^=section-detailed] > div > div.detailedSheetOtherInfo > div.detailedSheetFirstBlock > div.titleInside > h1 > span'
    )
    const features = Array.from(
      document.querySelectorAll(
        '[id^=section-detailed] > div > div.detailedSheetOtherInfo > section.detailsSection.detailsSection_aboutThisProperty > div.allDetails > .labelInfo'
      )
    )

    let furnished = false
    let surface = null
    let rooms = null

    features.forEach((feature) => {
      if (feature.textContent.match(/m²/g) && !feature.textContent.toLowerCase().includes('balcon')) {
        surface = feature
      } else if (feature.textContent.match(/pièce/g)) {
        rooms = feature
      } else if (feature.textContent.match(/Meublé/g)) {
        furnished = true
      }
    })

    if (!title && !description && !price && !cityLabel) {
      return null
    }

    return {
      id: null,
      cityLabel: cityLabel && cityLabel.textContent,
      description: description && description.textContent,
      furnished,
      price: price?.textContent,
      hasCharges: !!hasCharges?.textContent?.includes('charges comprises'),
      charges: charges?.textContent?.match(/\d+/)?.length && charges?.textContent?.match(/\d+/)[0],
      renter: renter?.getAttribute('title'),
      rooms: rooms?.textContent,
      surface: surface?.textContent,
      title: title?.textContent,
    }
  }
}
