import { virtualConsole } from '@helpers/jsdome'
import { LoueragileMapping } from '@interfaces/mapping'
import jsdom from 'jsdom'
import { particulierToken } from '../../helpers/particulier'
const { JSDOM } = jsdom

export class LoueragileScrapping {
  static scrap(data: string): LoueragileMapping {
    const { document } = new JSDOM(data, {
      virtualConsole: virtualConsole(),
    }).window

    const title = document.querySelector('h2.sc-bdVaJa.lgBYTT')
    const description = document.querySelector('p.sc-bxivhb.fcnykg')
    const price = document.querySelector('p.wsn.sc-bxivhb.hmmXKG')
    const cityLabel = document.querySelector('h2.sc-bdVaJa.lgBYTT > span')
    const renterElement = document.querySelector(
      'a.sc-bdVaJa.QbUVD > span.fls.sc-bdVaJa.cyvIwy'
    )
    const renter = renterElement.textContent.split(" ").pop()

    const stationElement = document.querySelectorAll('li.sc-bdVaJa.hmwSft')
    let stations = [...stationElement].map((el) => el.outerText)

    const positionElement = document.querySelector("a.tdu.sc-bdVaJa.kUTCNh")
    let [lng, lat] = positionElement & positionElement.href.contains("maps") ?
     positionElement.href.split("=").slice(-1) ?
      positionElement.href.split("=").slice(-1)[0].split(",") : null : null
  
    let area = title & title.textContent.split("- ").slice(2)
    let room = title & title.textContent.split("- ").slice(1)


    if (!title && !description && !price && !cityLabel) {
      return null
    }

    const cityLabelText = cityLabel && cityLabel.textContent


    return {
      city: cityLabelText,
      lng,
      lat,
      description: description && description.textContent,
      furnished: null,
      postal_code: null,
      rent: price && price.textContent,
      source: renter,
      room,
      area,
      title: title && title.textContent,
      stops: stations
  }
}
