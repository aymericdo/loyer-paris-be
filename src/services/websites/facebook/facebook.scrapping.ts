import { FacebookMapping } from '@interfaces/mapping'
import { ERROR_CODE } from '@services/api/errors'
import { virtualConsole } from '@services/helpers/jsdome'
import jsdom from 'jsdom'
const { JSDOM } = jsdom

export class FacebookScrapping {
  static scrap(data: string): FacebookMapping {
    const { document } = new JSDOM(data, {
      virtualConsole: virtualConsole(),
    }).window

    const sectionTitleElem = document.querySelector(
      '[id^=mount_] > div > div:nth-child(1) > div > div > div > div > div > div > div > div > div > div > div > div > div:nth-child(1) > div > div > div > div > div > div h1'
    )?.parentElement

    if (!sectionTitleElem || !sectionTitleElem.textContent.includes('Locations')) {
      throw { error: ERROR_CODE.Other, msg: 'not a rent' }
    }

    const title = document.querySelector(
      '[id^=mount_] > div > div:nth-child(1) > div > div > div > div > div > div > div > div > div > div > div > div > div:nth-child(1) > div > div > div > div > div > div h1'
    )

    const description = document.querySelector(
      '[id^=mount_] > div > div:nth-child(1) > div > div > div > div > div > div > div > div > div > div > div > div > div:nth-child(1) > div > div > div > div > div > div > div > div.x1gslohp > div > div > div > span'
    )
    const price = document.querySelector(
      '[id^=mount_] > div > div:nth-child(1) > div > div > div > div > div > div > div > div > div > div > div > div > div:nth-child(1) > div > div > div > div > div > div div.x1anpbxc > span'
    )
    const renter = document.querySelector(
      '[id^=mount_] > div > div:nth-child(1) > div > div.rq0escxv.l9j0dhe7.du4w35lb > div > div > div.j83agx80.cbu4d94t.d6urw2fd.dp1hu0rb.l9j0dhe7.du4w35lb > div.rq0escxv.l9j0dhe7.du4w35lb.j83agx80.pfnyh3mw.jifvfom9.gs1a9yip.owycx6da.btwxx1t3.buofh1pr.dp1hu0rb > div.rq0escxv.l9j0dhe7.du4w35lb.j83agx80.cbu4d94t.g5gj957u.d2edcug0.hpfvmrgz.rj1gh0hx.buofh1pr.dp1hu0rb > div > div > div > div > div > div.cwj9ozl2.j83agx80.cbu4d94t.m6nq13hx.owwhemhu.ni8dbmo4.stjgntxs.spskuzq3 > div > div.am9z0op8.j83agx80.o387gat7.datstx6m.l9j0dhe7.k4urcfbm.jr1d8bo4.dwxd3oue > div > div.q5bimw55.rpm2j7zs.k7i0oixp.gvuykj2m.j83agx80.cbu4d94t.ni8dbmo4.eg9m0zos.l9j0dhe7.du4w35lb.ofs802cu.pohlnb88.dkue75c7.mb9wzai9.d8ncny3e.buofh1pr.g5gj957u.tgvbjcpo.l56l04vs.r57mb794.kh7kg01d.c3g1iek1.k4xni2cv.do00u71z.ofv0k9yr.k4urcfbm.spskuzq3 > div.j83agx80.cbu4d94t.buofh1pr.l9j0dhe7 > div.aahdfvyu > div:nth-child(1) > div > div > div > div > div > div > div > span > span > span'
    )
    const cityLabel = document.querySelector(
      '[id^=mount_] > div > div:nth-child(1) > div > div > div > div > div > div > div > div > div > div > div > div > div:nth-child(1) > div > div > div > div > div > div > div.xsag5q8 > div > div > div:nth-child(1) > span'
    )

    const features = Array.from(
      document.querySelectorAll(
        '[id^=mount_] div.xwib8y2 div.xjyslct'
      )
    )

    let furnished = null
    let surface = null
    let rooms = null

    features.forEach((feature) => {
      if (feature.textContent.match(/mètres/g)) {
        surface = feature
      } else if (feature.textContent.match(/pièce/g)) {
        rooms = feature
      } else if (feature.textContent.match(/Meublé/g)) {
        furnished = feature
      }
    })

    if (!title && !description && !price && !cityLabel) {
      return null
    }

    return {
      id: null,
      address: cityLabel && cityLabel.textContent,
      cityLabel: cityLabel && cityLabel.textContent,
      description: description && description.textContent,
      furnished: furnished && furnished.textContent ? true : false,
      price: price && price.textContent,
      renter: renter && !renter.textContent.includes('particulier') ? renter.textContent : null,
      rooms: rooms && rooms.textContent,
      surface: surface && surface.textContent,
      title: title && title.textContent,
    }
  }
}
