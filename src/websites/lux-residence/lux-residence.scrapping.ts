import { virtualConsole } from "@helpers/jsdome"
import { FacebookMapping } from "@interfaces/mapping"
import jsdom from 'jsdom'
const { JSDOM } = jsdom

export class LuxResidenceScrapping {
  static scrap(data: string): FacebookMapping {
    const { document } = new JSDOM(data, { virtualConsole: virtualConsole() }).window
    
    const title = document.querySelector("div.mosaicContainer > div.detailBannerInfos > div > h1 > div.annonceSpecsVille > div.annonceSpecsListItemVille")
    const description = document.querySelector("#wrapper > div.detail > div > div.detailWrapInfos > div.detailDesc.wrapMain > p.detailDescSummary")
    const price = document.querySelector("div.mosaicContainer > div.detailBannerInfos > div > h1 > div.annonceSpecsVille > div.annonceSpecsListItemPrice")
    const renter = document.querySelector("#wrapper > div.detail > div > div.detailWrapInfos > div.wrapMain.agencyContactContainer.js_contact_wrapper > aside > div.agencyContactPanels.js_panel > span > picture > img")
    const cityLabel = document.querySelector("div.mosaicContainer > div.detailBannerInfos > div > h1 > div.annonceSpecsVille > div.annonceSpecsListItemVille")

    const features = [...document.querySelectorAll('div.mosaicContainer > div.detailBannerInfos > div > h1 > div.annonceSpecs > ul > li')]
    const features2 = [...document.querySelectorAll('#wrapper > div.detail > div > div.detailWrapInfos > div:nth-child(5) > div:nth-child(2) > ul > li > ul > li')]

    let furnished = false
    let surface = null
    let rooms = null

    features.forEach(feature => {
      if (feature.textContent.match(/m²/g)) {
        surface = feature
      } else if (feature.textContent.match(/pièce/g)) {
        rooms = feature
      } else if (feature.textContent.match(/Meublé/g)) {
        furnished = feature
      }
    })

    features2.forEach(feature => {
      if (feature.textContent.match(/Meublé/g)) {
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
      price: price && price.textContent,
      renter: renter ? renter.getAttribute('title') : null,
      rooms: rooms && rooms.textContent,
      surface: surface && surface.textContent,
      title: title && title.textContent,
    }
  }
}
