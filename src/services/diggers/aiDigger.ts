import { google } from '@ai-sdk/google'
import { cityList } from '@services/filters/city-filter/city-list'
import { generateObject } from 'ai'
import { z } from 'zod'

const CoordinateSchema = z.object({
  lat: z.number(),
  lng: z.number(),
})

export const CleanAdSchema = z.object({
  id: z.string(),
  roomCount: z.number(),
  hasFurniture: z.boolean(),
  surface: z.number(),
  price: z.number(),
  address: z.string(),
  postalCode: z.string(),
  city: z.enum(cityList as [string, ...string[]]),
  coordinates: CoordinateSchema,
  yearBuilt: z.array(z.number()),
  renter: z.string().describe('The name of the renting company'),
  stations: z.array(z.string()).describe('The names of the nearest stations'),
  charges: z.number().describe('The extra charges in addition to the base rent'),
  hasCharges: z.boolean().describe('Whether the rent includes extra charges'),
  isHouse: z.boolean().optional(),
  dpe: z.enum(['A', 'B', 'C', 'D', 'E', 'F', 'G']).nullable().optional(),
  rentComplement: z.number().describe('The rent complement when rent is over legal limit').nullable().optional(),
})

export type CleanAd = z.infer<typeof CleanAdSchema>

export async function extrcatAdData(rawHtml: string) {
  const model = google('gemini-2.0-flash-001')
  try {
    const { object: result } = await generateObject({
      model,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `You are an expert data extractor. Your task is to meticulously analyze the provided HTML content and extract key information about a rental property. The data should be returned as a JSON object that perfectly matches the following schema. Fill the fields only if you're absolutely sure, don't guess. \\${rawHtml} `,
            },
          ],
        },
      ],
      schema: CleanAdSchema,
    })

    return result
  } catch (error) {
    console.error(error)
    throw new Error('Failed to parse website')
  }
}
