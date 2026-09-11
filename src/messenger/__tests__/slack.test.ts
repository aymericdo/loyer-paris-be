import { Slack } from '@messenger/slack'
import { PrettyLog } from '@services/helpers/pretty-log'

afterEach(() => jest.restoreAllMocks())

/**
 * Le WebClient est construit dans le champ de la classe : on le remplace après
 * coup pour ne garder que la couture HTTP.
 */
const withClient = (postMessage: jest.Mock) => {
  const slack = new Slack()
  slack.client = { chat: { postMessage } } as never
  return slack
}

describe('Slack.sendMessage', () => {
  it('poste le texte sur le canal demandé', async () => {
    const postMessage = jest.fn().mockResolvedValue({ ok: true })

    await withClient(postMessage).sendMessage('#errors', 'boum')

    expect(postMessage).toHaveBeenCalledTimes(1)
    expect(postMessage).toHaveBeenCalledWith({
      channel: '#errors',
      text: 'boum',
    })
  })

  it('journalise la réponse de Slack hors production', async () => {
    const log = jest.spyOn(PrettyLog, 'call')
    const response = { ok: true, ts: '1.2' }

    await withClient(jest.fn().mockResolvedValue(response)).sendMessage(
      '#errors',
      'boum',
    )

    expect(log).toHaveBeenCalledWith(JSON.stringify(response), 'green')
  })

  it('avale une panne du client sans faire échouer l’appelant', async () => {
    const error = new Error('slack down')
    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {})

    await expect(
      withClient(jest.fn().mockRejectedValue(error)).sendMessage(
        '#errors',
        'boum',
      ),
    ).resolves.toBeUndefined()

    expect(consoleError).toHaveBeenCalledWith(error)
  })

  it('ne journalise rien quand l’envoi échoue', async () => {
    const log = jest.spyOn(PrettyLog, 'call')
    jest.spyOn(console, 'error').mockImplementation(() => {})

    await withClient(
      jest.fn().mockRejectedValue(new Error('boom')),
    ).sendMessage('#errors', 'boum')

    expect(log).not.toHaveBeenCalled()
  })
})
