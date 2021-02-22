import { SelogerMapping } from "@interfaces/mapping"
import jsdom from 'jsdom'
const { JSDOM } = jsdom

export class SelogerScrapping {
  static scrap(data: string): SelogerMapping {
    const { document } = new JSDOM(data).window

    const title = document.querySelector('.detail-title.title1') || document.querySelector('.Title__ShowcaseTitleContainer-sc-4479bn-0')
    const description = document.querySelector('div.description-bien > section.categorie > p') || document.querySelector('.TitledDescription__TitledDescriptionContent-sc-1r4hqf5-1.dMkXAI') || document.querySelector('.TitledDescription__TitledDescriptionContent-sc-1r4hqf5-1.koqVoo')
    const price = document.getElementById('price') || document.querySelector('.Summary__Text-sc-1wkzvu-6.Summary__PriceText-sc-1wkzvu-9.fulWhK') || document.querySelector('.Summarystyled__PriceContainer-tzuaot-7')
    const cityLabel = document.querySelector("#neighborhood-map > p > strong")
    const renter = document.querySelector('.agence-title') || document.querySelector('.LightSummary__Title-f6k8ax-2.kqLAJb') || document.querySelector('.LightSummary__Title-f6k8ax-1.lnUnld') || document.querySelector("#agence-info > div.Agency__PrimaryBlock-sc-1rsw64j-5.dNsjKe > h3")
    const itemTags = (document.querySelector('.resume ul.criterion > li') && [...document.querySelectorAll('.resume ul.criterion > li')])
        || (document.querySelector('.Summary__TagsWrapper-sc-1wkzvu-7.emAUgN > div') && [...document.querySelectorAll('.Summary__TagsWrapper-sc-1wkzvu-7.emAUgN > div')])
        || (document.querySelector('.Summarystyled__TagsWrapper-tzuaot-19 > div') && [...document.querySelectorAll('.Summarystyled__TagsWrapper-tzuaot-19 > div')])
        || (document.querySelector('.TagsWithIcon__TagContainer-j1x9om-1') && [...document.querySelectorAll('.TagsWithIcon__TagContainer-j1x9om-1')])
    const optionsSection = (document.querySelector('section.categorie .criteria-wrapper > div') && [...document.querySelectorAll('section.categorie .criteria-wrapper > div')]) || (document.querySelector('.GeneralList__List-sc-9gtpjm-0.BAyYz > li') && [...document.querySelectorAll('.GeneralList__List-sc-9gtpjm-0.BAyYz > li')])
    const chargesElement = document.querySelector('section.categorie.with-padding-bottom .sh-text-light') || document.querySelector('#a-propos-de-ce-prix .TitledDescription__TitledDescriptionContent-sc-1r4hqf5-1.dMkXAI > div')

    let surface = null
    let rooms = null

    let chargesArray = chargesElement && chargesElement.innerHTML.split('span')
    let chargesIndex = chargesArray && chargesArray.indexOf(chargesArray.find(elem => elem.search('charges') !== -1))
    let charges = chargesArray && chargesArray.length && chargesArray[chargesIndex + 1]

    if (!charges) {
        chargesArray = chargesElement && chargesElement.innerHTML.split('<br>')
        charges = chargesArray && chargesArray.length > 1 && chargesArray[1].match(/\d+/) && chargesArray[1].match(/\d+/)[0] || ''
    }

    if (!charges) {
        const chargesElem = document.querySelector('.Pricestyled__Panel-uc7t2j-4 > div > strong')
        charges = chargesElem && chargesElem.textContent.match(/\d+/) && chargesElem.textContent.match(/\d+/)[0] || ''
    }

    const furnished = optionsSection.some(el => {
        return el.textContent.match(/^Meublé/g)
    })

    const yearBuilt = optionsSection.find(el => {
        return el.textContent.match(/^Année de construction/g)
    })

    let isParticulier = false

    itemTags.forEach(tag => {
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

    const cityLabelText = cityLabel && cityLabel.textContent.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace('a', '')

    return {
        id: null,
        cityLabel: cityLabelText,
        charges,
        description: description && description.textContent,
        furnished,
        hasCharges: price && price.textContent.includes('CC'),
        price: price && price.textContent,
        renter: isParticulier ? 'Particulier' : renter ? renter.textContent.includes('particulier') ? 'Particulier' : renter.textContent : null,
        rooms: rooms && rooms.textContent,
        surface: surface && surface.textContent,
        yearBuilt: yearBuilt && yearBuilt.textContent,
        title: title && title.textContent,
    }
  }
}