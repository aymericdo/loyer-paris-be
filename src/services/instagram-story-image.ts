import sharp from 'sharp'

export type InstagramStoryData = {
  city: string
  website: string
  maxPrice: number
  observedPrice: number
}

const WIDTH = 1080
const HEIGHT = 1920

const escapeXml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

const formatPrice = (value: number): string =>
  new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(value)

export async function createInstagramStoryImage(
  data: InstagramStoryData,
): Promise<Buffer> {
  const city = escapeXml(data.city)
  const website = escapeXml(data.website)
  const excess = formatPrice(data.observedPrice - data.maxPrice)
  const observedPrice = formatPrice(data.observedPrice)
  const maxPrice = formatPrice(data.maxPrice)

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
      <defs>
        <linearGradient id="background" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#102a43"/>
          <stop offset="100%" stop-color="#176b68"/>
        </linearGradient>
      </defs>
      <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#background)"/>
      <circle cx="950" cy="210" r="290" fill="#ffffff" opacity="0.05"/>
      <circle cx="80" cy="1550" r="350" fill="#ffffff" opacity="0.05"/>
      <text x="88" y="188" fill="#b9e7d8" font-family="Arial, sans-serif" font-size="34" font-weight="700" letter-spacing="4">ENCADREMENT DES LOYERS</text>
      <text x="88" y="400" fill="#ffffff" font-family="Arial, sans-serif" font-size="54" font-weight="700">Une annonce repérée</text>
      <text x="88" y="482" fill="#ffffff" font-family="Arial, sans-serif" font-size="54" font-weight="700">à ${city}</text>
      <text x="88" y="552" fill="#d9e8ef" font-family="Arial, sans-serif" font-size="30">Source : ${website}</text>
      <text x="88" y="690" fill="#ffd166" font-family="Arial, sans-serif" font-size="38" font-weight="700">DÉPASSEMENT ESTIMÉ</text>
      <text x="88" y="850" fill="#ffffff" font-family="Arial, sans-serif" font-size="126" font-weight="700">+${excess} €</text>
      <text x="88" y="910" fill="#d9e8ef" font-family="Arial, sans-serif" font-size="34">par mois, hors charges</text>
      <rect x="64" y="1030" width="952" height="480" rx="36" fill="#ffffff" opacity="0.11"/>
      <text x="112" y="1140" fill="#d9e8ef" font-family="Arial, sans-serif" font-size="32">LOYER OBSERVÉ (HORS CHARGES)</text>
      <text x="112" y="1230" fill="#ffffff" font-family="Arial, sans-serif" font-size="64" font-weight="700">${observedPrice} € / mois</text>
      <line x1="112" y1="1284" x2="968" y2="1284" stroke="#ffffff" opacity="0.25"/>
      <text x="112" y="1360" fill="#d9e8ef" font-family="Arial, sans-serif" font-size="32">PLAFOND ESTIMÉ (HORS CHARGES)</text>
      <text x="112" y="1430" fill="#ffffff" font-family="Arial, sans-serif" font-size="52" font-weight="700">${maxPrice} € / mois</text>
      <text x="540" y="1610" text-anchor="middle" fill="#d9e8ef" font-family="Arial, sans-serif" font-size="30">Retrouvez les annonces sur</text>
      <text x="540" y="1665" text-anchor="middle" fill="#ffd166" font-family="Arial, sans-serif" font-size="36" font-weight="700">https://selection.encadrement-loyers.fr/</text>
      <text x="88" y="1750" fill="#d9e8ef" font-family="Arial, sans-serif" font-size="26">Annonce collectée au cours des dernières 24 heures.</text>
      <text x="88" y="1795" fill="#d9e8ef" font-family="Arial, sans-serif" font-size="26">Estimation automatisée à vérifier au cas par cas.</text>
    </svg>
  `

  return sharp(Buffer.from(svg)).jpeg({ quality: 90 }).toBuffer()
}

let latestInstagramStoryImage: Buffer | undefined

export const setLatestInstagramStoryImage = (image: Buffer): void => {
  latestInstagramStoryImage = image
}

export const getLatestInstagramStoryImage = (): Buffer | undefined =>
  latestInstagramStoryImage
