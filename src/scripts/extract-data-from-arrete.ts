import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';
import fs from 'fs';

const schema = z.object({
  zone: z.number().min(1).max(10),
  nombre_de_piece: z.string().describe('Nombre de pièces'),
  annee_de_construction: z.string(),
  prix_med: z.string().min(1).max(100),
  prix_max: z.string().min(1).max(100),
  prix_min: z.string().min(1).max(100),
  meuble: z.boolean().describe("Logement meublé ou non"),
  maison: z.boolean().describe("Logement en maison ou appartement")
});

async function extractDataFromArrete(filePath: string) {
  const { object} = await generateObject({
    model: google('gemini-2.5-flash-lite'),
    schema,
    output: 'array',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Prompt:
              You are an expert data extractor. Analyze the provided legal text containing rent control tables ("Loyer de référence") for both "Appartements" and "Maisons".

              **Extraction Rules:**
              1. **Dual Extraction:** The source tables list "Locations non meublées" and "Locations meublées" side-by-side. For every row (Zone + Room Count + Era), you must generate **two** separate JSON entries: one where 'meuble' is false, and one where 'meuble' is true.
              2. **Column Mapping:**
                 - "Loyer de référence" → 'prix_med'
                 - "Loyer de référence majoré" → 'prix_max'
                 - "Loyer de référence minoré" → 'prix_min'
                 - *Ignore columns labeled "Majoration unitaire".*
              3. **Data Cleaning:**
                 - Treat "4 et +" room counts as string '4 et plus'.
                 - Extract all Zones (1, 2, 3) exhaustively.
                 - Fix OCR fragmentation (e.g., if a number is split like "1 8,7", read as "18,7").

              Extract every single data point found in the document into the defined JSON array.
            `,
          },
          {
            type: 'file',
            data: fs.readFileSync(filePath),
            mediaType: 'application/pdf',
          },
        ],
      },
    ],
  });

  return object
}


async function main() {

  const inputFilePath = './arrete.pdf';
  const outputFilePath = './output.json';

  const data = await extractDataFromArrete(inputFilePath);

  fs.writeFileSync(outputFilePath, JSON.stringify(data, null, 2));
}


main()
