import { rentControlPeriods } from '@services/city-config/city-selectors'
import {
  AvailableMainCities,
  RentControlPeriod,
} from '@services/city-config/main-cities'

/**
 * Quel arrêté préfectoral s'applique à une ville à une date donnée.
 *
 * Vit dans son propre module pour casser un cycle d'imports : FilterParent en a
 * besoin, or la fabrique de filtres (qui portait cette logique) importe
 * FilterParent.
 */
export const getJsonPathForDate = (
  periods: RentControlPeriod[],
  date: Date,
): string => {
  if (periods.length === 1) {
    return `json-data/${periods[0].file}`
  }

  const matchingPeriod = periods.find((p) => {
    if (!p.start || !p.end) return false
    return date >= new Date(p.start) && date <= new Date(p.end)
  })

  if (!matchingPeriod) {
    return `json-data/${periods[periods.length - 1].file}`
  }

  return `json-data/${matchingPeriod.file}`
}

export const getJsonPath = (
  city: AvailableMainCities,
  date: Date | null,
): string => {
  const periods = rentControlPeriods(city)

  if (!periods?.length) {
    throw `There is no criteria data for ${city}`
  }

  if (date) {
    return getJsonPathForDate(periods, date)
  }

  return `json-data/${periods[periods.length - 1].file}`
}
