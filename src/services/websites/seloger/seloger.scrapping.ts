import { SelogerMapping } from '@interfaces/scrap-mapping'
import { virtualConsole } from '@services/helpers/jsdome'
import { PARTICULIER } from '@services/websites/website'
import jsdom from 'jsdom'
const { JSDOM } = jsdom

export class SelogerScrapping {
  static scrap(data: string): SelogerMapping {
    const { document } = new JSDOM(data, {
      virtualConsole: virtualConsole(),
    }).window

    const title =
      document.querySelector('.detail-title.title1') ||
      document.querySelector('.Title__ShowcaseTitleContainer-sc-4479bn-0') ||
      document.querySelector('.Summarystyled__Title-sc-1u9xobv-3')
    const description =
      document.querySelector('div.description-bien > section.categorie > p') ||
      document.querySelector('.TitledDescription__TitledDescriptionContent-sc-1r4hqf5-1.dMkXAI') ||
      document.querySelector('.TitledDescription__TitledDescriptionContent-sc-1r4hqf5-1.koqVoo') ||
      document.querySelector('.Descriptionstyled__StyledShowMoreText-sc-1uunii4-2')
    const price = document.querySelector('[class^=Summarystyled__PriceContainer]')

    const cityLabel =
      document.querySelector('#neighborhood-map > p > strong') ||
      document.querySelector('#root > div > main > div > div > div > p > span[class^=Localisationstyled]') ||
      document.querySelector('p > span[class^=Localizationstyled__City]')
    const renter =
      document.querySelector('.agence-title') ||
      document.querySelector('.LightSummary__Title-f6k8ax-2.kqLAJb') ||
      document.querySelector('.LightSummary__Title-f6k8ax-1.lnUnld') ||
      document.querySelector('#agence-info > div.Agency__PrimaryBlock-sc-1rsw64j-5.dNsjKe > h3') ||
      document.querySelector(
        'div.Wrapper__ContactWrapper-sc-wbkua2-0.fZhnkl > div > div > div.LightSummarystyled__SummaryContainer-sc-k5t1l5-8.gapjyf > h3.LightSummarystyled__Title-sc-k5t1l5-1'
      ) ||
      document.querySelector(
        'div.Wrapper__ContactWrapper-sc-wbkua2-0.fZhnkl > div > div > div.LightSummarystyled__TextContainer-sc-k5t1l5-9.ehuHOZ > div.LightSummarystyled__SubNameDiv-sc-k5t1l5-7.gxaKvx'
      )
    const itemTags =
      (document.querySelector('[class^=Summarystyled__TagsWrapper] > div') &&
        [...document.querySelectorAll('[class^=Summarystyled__TagsWrapper] > div')]) ||
      []
    const optionsSection =
      (document.querySelector('section.categorie .criteria-wrapper > div') &&
        [...document.querySelectorAll('section.categorie .criteria-wrapper > div')]) ||
      (document.querySelector('.GeneralList__List-sc-9gtpjm-0.BAyYz > li') &&
        [...document.querySelectorAll('.GeneralList__List-sc-9gtpjm-0.BAyYz > li')])
    const chargesElement =
      document.querySelector('section.categorie.with-padding-bottom .sh-text-light') ||
      document.querySelector(
        '#a-propos-de-ce-prix .TitledDescription__TitledDescriptionContent-sc-1r4hqf5-1.dMkXAI > div'
      ) ||
      document.querySelector(
        'section.Pricestyled__Container-sc-r5ze64-1.chwYTh > div.Pricestyled__LeftColumn-sc-r5ze64-2.exUqVO > div.Pricestyled__Panel-sc-r5ze64-4.gCpVOb'
      )

    let surface = null
    let rooms = null

    let chargesArray = chargesElement && chargesElement.innerHTML.split('span')
    const chargesIndex =
      chargesArray && chargesArray.indexOf(chargesArray.find((elem) => elem.search('charges') !== -1))
    let charges = chargesArray && chargesArray.length && chargesArray[chargesIndex + 1]

    if (!charges) {
      chargesArray = chargesElement && chargesElement.innerHTML.split('<br>')
      charges =
        (chargesArray && chargesArray.length > 1 && chargesArray[1].match(/\d+/) && chargesArray[1].match(/\d+/)[0]) ||
        ''
    }

    if (!charges) {
      const chargesElem = document.querySelector('.Pricestyled__Panel-uc7t2j-4 > div > strong')
      charges = (chargesElem && chargesElem.textContent.match(/\d+/) && chargesElem.textContent.match(/\d+/)[0]) || ''
    }

    const furnished = optionsSection?.some((el) => {
      return el.textContent.match(/^Meublé/g)
    })

    const yearBuilt = optionsSection?.find((el) => {
      return el.textContent.match(/^Année de construction/g)
    })

    let isParticulier = false

    itemTags.forEach((tag) => {
      if (tag.textContent.match(/m²/g)) {
        surface = tag
      } else if (tag.textContent.match(/pièce/g)) {
        rooms = tag
      } else if (tag.textContent.match(/Particulier/g)) {
        isParticulier = true
      }
    })

    if (!title && !description && !price && !cityLabel) {
      return null
    }

    const cityLabelText = cityLabel && cityLabel.textContent

    const dpeElem = document.querySelector(
      '.Preview__PreviewTile-sc-9hhhpm-1 Preview__PreviewFocusedTile-sc-9hhhpm-2 > p'
    )

    return {
      id: null,
      cityLabel: cityLabelText,
      charges,
      description: description && description.textContent,
      furnished,
      hasCharges: price && price.textContent.includes('CC'),
      price: price && price.textContent,
      renter: isParticulier ? PARTICULIER : renter ? renter.textContent : null,
      rooms: rooms && rooms.textContent,
      surface: surface && surface.textContent,
      yearBuilt: yearBuilt && yearBuilt.textContent,
      title: title && title.textContent,
      dpe: dpeElem && dpeElem.textContent,
    }
  }
}
