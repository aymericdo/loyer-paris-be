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
      document.querySelector('[class^="Title__ShowcaseTitleContainer-sc"]') ||
      document.querySelector('[class^="Summarystyled__Title-sc"]')
    const description =
      document.querySelector('div.description-bien > section.categorie > p') ||
      document.querySelector('[class^="TitledDescription__TitledDescriptionContent-sc-"]') ||
      document.querySelector('[class^="Descriptionstyled__StyledShowMoreText-sc-"]')
    const price = document.querySelector('[class^=Summarystyled__PriceContainer]')

    const cityLabel =
      document.querySelector('#neighborhood-map > p > strong') ||
      document.querySelector('#root > div > main > div > div > div > p > span[class^=Localisationstyled]') ||
      document.querySelector('p > span[class^=Localizationstyled__City]')
    const renter =
      document.querySelector('.agence-title') ||
      document.querySelector('[class^="LightSummary__Title-"]') ||
      document.querySelector('h3[class^="LightSummarystyled__Title-sc-"]') ||
      document.querySelector('#agence-info > div.Agency__PrimaryBlock-sc-1rsw64j-5.dNsjKe > h3') ||
      document.querySelector('[class^="LightSummarystyled__SubNameDiv-sc-"]')

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
      document.querySelector('h3[class^="LightSummarystyled__SubNameDiv-sc-"]') ||
      document.querySelector('#a-propos-de-ce-prix [class^="TitledDescription__TitledDescriptionContent-sc-"] > div') ||
      document.querySelector('section [class^="Pricestyled__Panel-sc-"]')

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

    let yearBuilt = optionsSection?.find((el) => {
      return el.textContent.match(/^Année de construction/g)
    })

    const basicFeatures = [...document.querySelectorAll('[data-test="basic-features"] > div')]
    if (!yearBuilt) {
      yearBuilt = basicFeatures?.find((el) => {
        return el.textContent.match(/^Construit en/g)
      })
    }

    let isParticulier = false

    itemTags.forEach((tag) => {
      if (tag.textContent.match(/m²/g) && !tag.textContent.match(/terrain/gi)) {
        surface = tag
      } else if (tag.textContent.match(/pièce/gi)) {
        rooms = tag
      } else if (tag.textContent.match(/Particulier/g)) {
        isParticulier = true
      }
    })

    if (!title && !description && !price && !cityLabel) {
      return null
    }

    const cityLabelText = cityLabel && cityLabel.textContent

    const dpeElem = document.querySelector('[data-test="diagnostics-preview-bar-energy"] div div[class^="Previewstyled__Grade-sc-"]')

    return {
      id: null,
      cityLabel: cityLabelText,
      charges,
      description: description?.textContent,
      furnished,
      hasCharges: price && price.textContent.includes('CC'),
      price: price?.textContent,
      renter: isParticulier ? PARTICULIER : renter ? renter.textContent : null,
      rooms: rooms?.textContent,
      surface: surface?.textContent,
      yearBuilt: yearBuilt?.textContent,
      title: title?.textContent,
      dpe: dpeElem?.textContent,
    }
  }
}
