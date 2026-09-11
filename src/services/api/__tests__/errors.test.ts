import { IncompleteRent } from '@db/db'
import { Slack } from '@messenger/slack'
import {
  ApiErrorsService,
  ERROR_CODE,
  ERROR500_MSG,
} from '@services/api/errors'
import { PrettyLog } from '@services/helpers/pretty-log'
import { closeDbConnections } from '@test-utils/website-test-harness'

afterAll(closeDbConnections)
afterEach(() => jest.restoreAllMocks())

const apiError = (over: object = {}) => ({
  error: ERROR_CODE.Minimal,
  msg: 'un message',
  ...over,
})

const service = (over: object = {}) =>
  new ApiErrorsService(apiError(over) as never)

describe('ApiErrorsService — code HTTP', () => {
  it('respecte un status explicite', () => {
    expect(service({ status: 429 }).status).toBe(429)
  })

  it.each([
    ERROR_CODE.Minimal,
    ERROR_CODE.Address,
    ERROR_CODE.BadLocation,
    ERROR_CODE.Colocation,
    ERROR_CODE.Price,
    ERROR_CODE.Surface,
    ERROR_CODE.Other,
  ])('rend %s en 400 (faute de l’annonce)', (error) => {
    expect(service({ error }).status).toBe(400)
  })

  it('rend un filtre non concluant en 422', () => {
    expect(service({ error: ERROR_CODE.Filter }).status).toBe(422)
  })

  it('rend une panne d’API d’adresse en 500', () => {
    expect(service({ error: ERROR_CODE.ApiAdresseError }).status).toBe(500)
  })

  it('rend un code inconnu en 500', () => {
    expect(service({ error: 'pas-un-code' }).status).toBe(500)
  })
})

describe('ApiErrorsService — journal', () => {
  it('écrit un filtre non concluant en rouge', () => {
    const log = jest.spyOn(PrettyLog, 'call')

    service({ error: ERROR_CODE.Filter, msg: 'aucun quartier trouvé' }).logger()

    expect(log).toHaveBeenCalledWith('aucun quartier trouvé', 'red')
  })

  it.each([
    ERROR_CODE.BadLocation,
    ERROR_CODE.Colocation,
    ERROR_CODE.Minimal,
    ERROR_CODE.Other,
    ERROR_CODE.Address,
    ERROR_CODE.Price,
    ERROR_CODE.Surface,
  ])('écrit %s en jaune (annonce fautive)', (error) => {
    const log = jest.spyOn(PrettyLog, 'call')

    service({ error, msg: 'un message' }).logger()

    expect(log).toHaveBeenCalledWith('un message', 'yellow')
  })

  it('préfixe une panne inconnue de [ERROR 500] et joint la pile', () => {
    const log = jest.spyOn(PrettyLog, 'call')

    service({ error: 'pas-un-code', stack: 'at truc' }).logger()

    expect(log).toHaveBeenCalledWith(`${ERROR500_MSG} at truc`, 'red')
  })

  it('joint une pile absente sans planter', () => {
    const log = jest.spyOn(PrettyLog, 'call')

    service({ error: ERROR_CODE.ApiAdresseError }).logger()

    expect(log).toHaveBeenCalledWith(`${ERROR500_MSG} undefined`, 'red')
  })
})

describe('ApiErrorsService — alerte Slack', () => {
  const sendMessage = () =>
    jest.spyOn(Slack.prototype, 'sendMessage').mockResolvedValue(undefined)

  it('prévient #bad-location en nommant le site', async () => {
    const send = sendMessage()

    await new ApiErrorsService({
      error: ERROR_CODE.BadLocation,
      msg: "city 'zorglub' not found in the list",
      incompleteAd: { id: '1', website: 'orpi', url: 'https://orpi.fr/1' },
    } as never).sendSlackErrorMessage()

    expect(send).toHaveBeenCalledWith(
      '#bad-location',
      "orpi : city 'zorglub' not found in the list",
    )
  })

  it('prévient #errors au-delà de 500, avec la pile', async () => {
    const send = sendMessage()
    const error = Object.assign(new Error('le scraper a cassé'), {
      error: ERROR_CODE.Other,
      msg: 'm',
      status: 503,
    })

    await new ApiErrorsService(error as never).sendSlackErrorMessage('SENTRY-1')

    expect(send).toHaveBeenCalledTimes(1)
    const [channel, message] = send.mock.calls[0]
    expect(channel).toBe('#errors')
    expect(message).toContain('Error 503 : Error: le scraper a cassé')
    expect(message).toContain('SENTRY-1')
  })

  it('alerte aussi les 500 exactement (pas seulement au-delà)', async () => {
    const send = sendMessage()
    const error = Object.assign(new Error('boom'), {
      error: ERROR_CODE.Other,
      msg: 'm',
      status: 500,
    })

    await new ApiErrorsService(error as never).sendSlackErrorMessage('X')

    expect(send).toHaveBeenCalledTimes(1)
  })

  it('reste silencieux sur une 400 ordinaire', async () => {
    const send = sendMessage()

    await service({ error: ERROR_CODE.Price }).sendSlackErrorMessage()

    expect(send).not.toHaveBeenCalled()
  })

  it('reste silencieux sur un mauvais emplacement sans annonce', async () => {
    const send = sendMessage()

    await service({ error: ERROR_CODE.BadLocation }).sendSlackErrorMessage()

    expect(send).toHaveBeenCalledWith('#bad-location', 'undefined : un message')
  })

  // CONSTAT D'AUDIT — le repli du lien Sentry interpole la variable qu'il est
  // censé remplacer : sans sentryId, le message publié contient
  // « query=undefined » au lieu d'une recherche utilisable.
  it('[constat] publie un lien Sentry « query=undefined » sans sentryId', async () => {
    const send = sendMessage()
    const error = Object.assign(new Error('boom'), {
      error: ERROR_CODE.Other,
      msg: 'm',
      status: 500,
    })

    await new ApiErrorsService(error as never).sendSlackErrorMessage()

    const message = send.mock.calls[0][1] as string
    expect(message).toContain(
      'https://encadrement-loyers.sentry.io/issues/?query=undefined',
    )
  })
})

describe('ApiErrorsService — annonce incomplète', () => {
  const saveRent = () =>
    jest
      .spyOn(IncompleteRent.prototype, 'save')
      .mockResolvedValue(undefined as never)

  const incompleteAd = (over: object = {}) => ({
    id: '42',
    website: 'orpi',
    url: 'https://orpi.fr/42',
    ...over,
  })

  let saved: Record<string, unknown>
  const captureSaved = () =>
    jest
      .spyOn(IncompleteRent.prototype, 'save')
      .mockImplementation(async function (this: never) {
        saved = (
          this as unknown as { toObject: () => Record<string, unknown> }
        ).toObject()
      })

  it('n’enregistre rien sans annonce incomplète', async () => {
    const save = saveRent()

    await service({ isIncompleteAd: true }).saveIncompleteRent()

    expect(save).not.toHaveBeenCalled()
  })

  it('n’enregistre rien quand le drapeau manque', async () => {
    const save = saveRent()

    await new ApiErrorsService({
      error: ERROR_CODE.BadLocation,
      msg: 'm',
      incompleteAd: incompleteAd(),
    } as never).saveIncompleteRent()

    expect(save).not.toHaveBeenCalled()
  })

  it('enregistre l’annonce avec sa ville', async () => {
    captureSaved()

    await new ApiErrorsService({
      error: ERROR_CODE.BadLocation,
      msg: 'ville introuvable',
      isIncompleteAd: true,
      incompleteAd: incompleteAd({ city: 'paris' }),
    } as never).saveIncompleteRent()

    expect(saved.id).toBe('42')
    expect(saved.url).toBe('https://orpi.fr/42')
    expect(saved.website).toBe('orpi')
    expect(saved.errorType).toBe(ERROR_CODE.BadLocation)
    expect(saved.errorMessage).toBe('ville introuvable')
    expect(saved.city).toBe('paris')
  })

  it('omet la ville quand elle est inconnue', async () => {
    captureSaved()

    await new ApiErrorsService({
      error: ERROR_CODE.BadLocation,
      msg: 'm',
      isIncompleteAd: true,
      incompleteAd: incompleteAd(),
    } as never).saveIncompleteRent()

    expect(saved).not.toHaveProperty('city')
  })

  it('annonce l’enregistrement', async () => {
    const log = jest.spyOn(PrettyLog, 'call')
    saveRent()

    await new ApiErrorsService({
      error: ERROR_CODE.BadLocation,
      msg: 'm',
      isIncompleteAd: true,
      incompleteAd: incompleteAd(),
    } as never).saveIncompleteRent()

    expect(log).toHaveBeenCalledWith('incomplete ad saved', 'green')
  })

  it('tolère un doublon sans bruit', async () => {
    const log = jest.spyOn(PrettyLog, 'call')
    jest
      .spyOn(IncompleteRent.prototype, 'save')
      .mockRejectedValue({ code: 11000 })

    await new ApiErrorsService({
      error: ERROR_CODE.BadLocation,
      msg: 'm',
      isIncompleteAd: true,
      incompleteAd: incompleteAd(),
    } as never).saveIncompleteRent()

    expect(log).toHaveBeenCalledWith('⚠️  incomplete ad already saved', 'red')
  })

  it('journalise les autres pannes d’enregistrement', async () => {
    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {})
    const error = new Error('mongo down')
    jest.spyOn(IncompleteRent.prototype, 'save').mockRejectedValue(error)

    await new ApiErrorsService({
      error: ERROR_CODE.BadLocation,
      msg: 'm',
      isIncompleteAd: true,
      incompleteAd: incompleteAd(),
    } as never).saveIncompleteRent()

    expect(consoleError).toHaveBeenCalledWith(error)
  })

  it('ne fait pas échouer l’appelant sur une panne d’enregistrement', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    jest
      .spyOn(IncompleteRent.prototype, 'save')
      .mockRejectedValue(new Error('mongo down'))

    await expect(
      new ApiErrorsService({
        error: ERROR_CODE.BadLocation,
        msg: 'm',
        isIncompleteAd: true,
        incompleteAd: incompleteAd(),
      } as never).saveIncompleteRent(),
    ).resolves.toBeUndefined()
  })
})
