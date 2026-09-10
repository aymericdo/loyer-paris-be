import { Ad } from '@interfaces/ad'
import { Body } from '@interfaces/scrap-mapping'
import { closeAllConnections } from '@db/db'
import type { Website } from '@services/websites/website'
import { Response } from 'express'
import { disconnect } from 'mongoose'
import fs from 'fs'
import path from 'path'

/**
 * Provenance d'une fixture : d'où vient le payload, quand il a été capturé, et
 * quelle variante de gabarit il représente.
 *
 * Sans provenance, une fixture est indiagnosticable : impossible de savoir si
 * un échec vient d'une régression ou d'un site qui a changé, ni de la
 * re-capturer. Le champ `variant` existe pour couvrir les permutations DOM
 * servies par les sites (A/B test) au lieu de laisser les fallbacks `??`
 * pourrir en code mort.
 */
export interface FixtureProvenance {
  /** Fichier payload, relatif au dossier `__tests__/` du scraper. */
  payload: string
  /** Ville de l'annonce capturée. */
  city: string
  /** URL de l'annonce au moment de la capture. */
  url: string
  /** Date ISO (YYYY-MM-DD) de la capture. */
  capturedAt: string
  /** Variante de gabarit servie par le site. `default` si pas de variante connue. */
  variant?: string
}

/** Un cas de contrat de parsing : la fixture d'entrée et l'`Ad` attendu. */
export interface ScrapingCase extends FixtureProvenance {
  /** Fichier JSON de l'`Ad` attendu, relatif au dossier `__tests__/` du scraper. */
  expected: string
}

/** Un scraper, vu comme « un payload brut entre, un `Ad` normalisé sort ». */
export type WebsiteClass = new (
  res: Response,
  props: { body: Body; id?: string },
) => Website

/** Charge le contenu brut d'une fixture — ce qui part dans `body.data`. */
export function readPayload(testDir: string, payloadFile: string): string {
  return fs.readFileSync(path.resolve(testDir, payloadFile), 'utf8')
}

/** Charge et parse une fixture JSON (attendu de contrat, payload encodé en JSON). */
export function readJsonFixture<T = unknown>(
  testDir: string,
  jsonFile: string,
): T {
  const filePath = path.resolve(testDir, jsonFile)
  const raw = fs.readFileSync(filePath, 'utf8')

  try {
    return JSON.parse(raw) as T
  } catch (err) {
    // Nommer la fixture : sans ça, une fixture corrompue donne un
    // « Unexpected token » impossible à rattacher à un fichier.
    throw new Error(
      `Fixture JSON invalide : ${path.relative(process.cwd(), filePath)} — ${
        (err as Error).message
      }`,
    )
  }
}

/**
 * Réponse Express inerte. Partagée par tous les tests de scraper : les suites
 * existantes la dupliquaient à l'identique.
 */
export function mockExpressResponse(): Response {
  return { json: jest.fn(), status: jest.fn() } as unknown as Response
}

/**
 * Contrat de parsing d'un scraper : le payload brut devient un `Ad` normalisé.
 *
 * Frontière volontairement basse — aucun accès à la base, aucun appel réseau.
 * `digData()` (géocodage, découpage des zones, encadrement, persistance) vit
 * au-dessus et se teste séparément. Une panne ici signifie donc toujours
 * « le mapping a cassé », jamais « les données distantes ont bougé ».
 */
export async function mapAdFromFixture(
  WebsiteClass: WebsiteClass,
  testDir: string,
  testCase: FixtureProvenance,
  props?: { id?: string; platform?: string },
): Promise<Ad> {
  const body: Body = {
    id: props?.id ?? '234523',
    data: readPayload(testDir, testCase.payload),
    platform: props?.platform ?? 'chrome',
    url: testCase.url,
  }

  return new WebsiteClass(mockExpressResponse(), { body }).mapping()
}

/**
 * Ferme les connexions Mongo du module `@db/db`.
 *
 * Nécessaire même pour un test de parsing : importer un scraper déclenche
 * `db.ts`, qui ouvre trois connexions au chargement du module. C'est un
 * couplage subi, pas voulu — à supprimer le jour où `db.ts` se connectera
 * paresseusement.
 */
export async function closeDbConnections(): Promise<void> {
  await closeAllConnections()
  await disconnect()
}
