/* eslint-disable no-undef */

import { execFileSync } from 'child_process'
import * as fs from 'fs'
import path from 'path'

/**
 * Capture une fixture de scraper depuis une annonce réelle, dans un vrai
 * navigateur.
 *
 * Les scrapers ne récupèrent jamais leurs pages eux-mêmes : c'est l'extension
 * du navigateur qui POSTe le `<body>` déjà rendu, que le serveur se contente
 * de parser. Il n'existe donc aucun moyen de les alimenter de l'extérieur —
 * `curl` se fait refuser (403 ou Cloudflare) sur la majorité des sites, et
 * quand il passe il renvoie le HTML d'avant rendu, donc un payload qui ne
 * ressemble pas à celui de la production.
 *
 * Ce script pilote `agent-browser` — Chrome réel, en fenêtre visible — et
 * écrit le payload dans le format exact qu'attend `readPayload()` : la chaîne
 * encodée en JSON telle qu'elle arrive dans `body.data`. Ce n'est pas un
 * détail : `readPayload()` lit le fichier brut et le scraper fait
 * `JSON.parse(body.data)`, donc un fichier contenant le HTML nu fait échouer
 * la suite avant même le premier test.
 *
 * Usage :
 *   npm run fixtures:record -- --url <url-annonce> --out <payload.json>
 *
 * Options :
 *   --session <nom>  session agent-browser, réutilisée entre deux captures
 *   --wait <ms>      attente après chargement (défaut 6000)
 *   --keep           laisser le navigateur ouvert, pour résoudre un captcha
 */
interface Options {
  url: string
  out: string
  session: string
  waitMs: number
  keep: boolean
}

const USAGE =
  'Usage : npm run fixtures:record -- --url <url-annonce> --out <payload.json>'

const DEFAULT_WAIT_MS = 6000

/**
 * Un `body` plus court que ça n'est pas une annonce : c'est une page de
 * blocage. Mieux vaut refuser d'écrire que produire une fixture qui fera
 * passer un test pour de mauvaises raisons.
 */
const MIN_BODY_LENGTH = 5000

const CHALLENGE_MARKERS = [
  'just a moment',
  'un instant',
  'prouvez que vous êtes un humain',
  'attention required',
  'access denied',
]

/**
 * Sortie du script. `process.stdout.write` plutôt que `console.log` : le
 * linter interdit la console, et un utilitaire en ligne de commande dont tout
 * le travail est de rendre compte n'a pas à s'en passer par treize exceptions.
 */
function log(message = ''): void {
  process.stdout.write(`${message}\n`)
}

/** Sortie d'erreur, même raison que `log()` : le linter bannit la console. */
function warn(message: string): void {
  process.stderr.write(`${message}\n`)
}

function parseArgs(argv: string[]): Options {
  const values: Record<string, string> = {}
  const flags = new Set<string>()

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (!arg.startsWith('--')) continue

    const [key, inline] = arg.slice(2).split('=')
    if (inline !== undefined) {
      values[key] = inline
    } else if (argv[i + 1] !== undefined && !argv[i + 1].startsWith('--')) {
      values[key] = argv[++i]
    } else {
      flags.add(key)
    }
  }

  if (!values.url || !values.out) {
    throw new Error(USAGE)
  }

  return {
    url: values.url,
    out: values.out,
    session: values.session ?? 'capture',
    waitMs: values.wait ? Number(values.wait) : DEFAULT_WAIT_MS,
    keep: flags.has('keep'),
  }
}

function agentBrowser(session: string, args: string[]): string {
  return execFileSync('agent-browser', ['--session', session, ...args], {
    encoding: 'utf8',
    maxBuffer: 128 * 1024 * 1024,
  })
}

/**
 * Évalue une expression dans la page et rend sa valeur.
 *
 * Le mode `--json` n'est pas une préférence de style : la sortie brute du CLI
 * repasse par un encodage qui n'est pas garanti fidèle pour une chaîne de
 * plusieurs centaines de kilo-octets, alors que `data.result` restitue la
 * valeur telle quelle.
 */
function evaluate(session: string, expression: string): unknown {
  const raw = agentBrowser(session, ['--json', 'eval', expression])

  let envelope: {
    success?: boolean
    data?: { result?: unknown }
    error?: string
  }
  try {
    envelope = JSON.parse(raw)
  } catch {
    throw new Error(
      `Réponse illisible du navigateur pour « ${expression} » : ${raw.slice(
        0,
        200,
      )}`,
    )
  }

  if (envelope.success !== true) {
    throw new Error(`Évaluation refusée par la page : ${envelope.error}`)
  }

  return envelope.data?.result
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Refuse les pages de blocage. Sans ce garde-fou, une capture sous Cloudflare
 * écrirait une fixture de « Just a moment… » qui ferait passer le contrat de
 * mapping pour de mauvaises raisons.
 */
function assertNotChallenged(session: string, url: string): void {
  const title = String(evaluate(session, 'document.title') ?? '')
  const lowered = title.toLowerCase()

  const marker = CHALLENGE_MARKERS.find((m) => lowered.includes(m))
  if (marker) {
    throw new Error(
      `Page de blocage détectée (« ${title} »). Résolvez-la à la main :\n` +
        `  agent-browser --session ${session} open "${url}"\n` +
        `puis relancez avec --session ${session}`,
    )
  }
}

function assertBodyIsAnAd(session: string, bodyLength: number): void {
  if (bodyLength < MIN_BODY_LENGTH) {
    throw new Error(
      `Le <body> ne fait que ${bodyLength} caractères : ce n'est pas une annonce. ` +
        'La page n’a probablement pas fini de se rendre — augmentez --wait.',
    )
  }
}

/**
 * Valide le payload contre lui-même avant de l'écrire.
 *
 * Le HTML est passé par un encodage JSON aller-retour. On exige que le
 * décodage rende exactement la longueur annoncée par la page : un écart
 * signalerait une troncature silencieuse, et la fixture serait fausse sans
 * que rien ne le dise.
 */
function assertRoundTripIsFaithful(
  encoded: string,
  bodyLength: number,
): string {
  let html: unknown
  try {
    html = JSON.parse(encoded)
  } catch (err) {
    throw new Error(`Le payload capturé n'est pas du JSON valide : ${err}`)
  }

  if (typeof html !== 'string' || html.length !== bodyLength) {
    throw new Error(
      `Aller-retour infidèle : la page annonce ${bodyLength} caractères, ` +
        `le payload en restitue ${
          typeof html === 'string' ? html.length : typeof html
        }.`,
    )
  }

  return html
}

/**
 * Contrôle la forme encodée telle qu'elle part sur le disque.
 *
 * C'est le contrôle qui manquait aux fixtures précédentes : sept d'entre elles
 * sont doublement encodées, ce qui laisse un `"` parasite en tête et remplace
 * les retours à la ligne par des `\n` littéraux. Le titre et la description
 * gelés dans leurs `expected` en portent encore la trace, et rien ne le
 * signalait — la paire fixture/attendu était cohérente avec elle-même, donc
 * verte, et fausse par rapport à ce que reçoit la production.
 */
function reviewEncoding(html: string): string[] {
  const notes: string[] = []
  const realNewlines = (html.match(/\n/g) ?? []).length
  const literalNewlines = (html.match(/\\n/g) ?? []).length

  if (!html.startsWith('<')) {
    notes.push(
      `le HTML ne commence pas par « < » mais par « ${html.slice(0, 12)} » : ` +
        'payload probablement doublement encodé',
    )
  }
  if (literalNewlines > 0) {
    notes.push(
      `${literalNewlines} séquences \\n littérales : les textes extraits ` +
        'contiendront des « \\n » au lieu de vrais retours à la ligne',
    )
  }
  if (realNewlines === 0) {
    notes.push('aucun retour à la ligne réel — payload probablement minifié')
  }

  return notes
}

function payloadSize(encoded: string): string {
  return `${(Buffer.byteLength(encoded, 'utf8') / 1024).toFixed(1)} Ko sur disque`
}

async function main(options: Options): Promise<void> {
  const { url, out, session, waitMs, keep } = options

  try {
    log(`→ ouverture de ${url}`)
    agentBrowser(session, ['--headed', 'open', url])

    log(`  attente de ${waitMs} ms (rendu du JS de la page)`)
    await sleep(waitMs)

    assertNotChallenged(session, url)

    const bodyLength = Number(
      evaluate(session, 'document.body.outerHTML.length'),
    )
    assertBodyIsAnAd(session, bodyLength)

    const title = String(evaluate(session, 'document.title') ?? '')
    const encoded = String(
      evaluate(session, 'JSON.stringify(document.body.outerHTML)'),
    )

    const html = assertRoundTripIsFaithful(encoded, bodyLength)

    const outputPath = path.resolve(process.cwd(), out)
    fs.mkdirSync(path.dirname(outputPath), { recursive: true })
    fs.writeFileSync(outputPath, encoded)

    log()
    log(`✔ écrit : ${path.relative(process.cwd(), outputPath)}`)
    log(`  titre    : ${title}`)
    log(`  <body>   : ${bodyLength} caractères, aller-retour fidèle`)
    log(`  encodage : ${payloadSize(encoded)}`)

    const notes = reviewEncoding(html)
    if (notes.length === 0) {
      log('  forme    : conforme')
    } else {
      for (const note of notes) {
        warn(`  ⚠ ${note}`)
      }
      process.exitCode = 1
    }

    log()
    log('Provenance à reporter dans le cas de test :')
    log(`  url: '${url}'`)
    log(`  capturedAt: '${new Date().toISOString().slice(0, 10)}'`)
  } finally {
    if (!keep) {
      agentBrowser(session, ['close'])
    }
  }
}

main(parseArgs(process.argv.slice(2))).catch((err: unknown) => {
  warn(`✘ ${err instanceof Error ? err.message : String(err)}`)
  process.exit(1)
})
