import { Rent } from '@db/db'

export async function getAllWithoutFilterData(): Promise<{ createdAt: string }[]> {
  return (await Rent.find({}, { createdAt: 1 }))
}