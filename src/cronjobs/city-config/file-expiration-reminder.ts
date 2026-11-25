import { Slack } from '@messenger/slack'
import { CITIES, RentControlPeriod } from '@services/city-config/main-cities'

type CityConfig = {
  label: string
  rentControlPeriods?: ReadonlyArray<RentControlPeriod>
}

type ExpiringFile = {
  file: string
  endDate: string
  cities: string[]
}

const DAYS_BEFORE_END = 7

const parseDate = (value: string): Date => {
  const date = new Date(`${value}T00:00:00.000Z`)

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
  ) {
    throw new Error(`Invalid city-config date: ${value}`)
  }

  return date
}

const formatDate = (date: Date): string => date.toISOString().slice(0, 10)

const addOneYear = (value: string): string => {
  const date = parseDate(value)
  const month = date.getUTCMonth()
  date.setUTCFullYear(date.getUTCFullYear() + 1)

  if (date.getUTCMonth() !== month) {
    date.setUTCDate(0)
  }

  return formatDate(date)
}

const getActivityEndDate = (period: RentControlPeriod): string | undefined => {
  if (period.end) {
    return formatDate(parseDate(period.end))
  }

  return period.start ? addOneYear(period.start) : undefined
}

export const findFilesEndingInOneWeek = (
  cities: Readonly<Record<string, CityConfig>>,
  today: string,
): ExpiringFile[] => {
  const reminderDate = parseDate(today)
  reminderDate.setUTCDate(reminderDate.getUTCDate() + DAYS_BEFORE_END)
  const endDateToRemind = formatDate(reminderDate)
  const expiringFiles = new Map<string, ExpiringFile>()

  Object.values(cities).forEach(({ label, rentControlPeriods = [] }) => {
    rentControlPeriods.forEach((period) => {
      const endDate = getActivityEndDate(period)

      if (endDate !== endDateToRemind) {
        return
      }

      const key = `${period.file}:${endDate}`
      const expiringFile = expiringFiles.get(key) ?? {
        file: period.file,
        endDate,
        cities: [],
      }

      if (!expiringFile.cities.includes(label)) {
        expiringFile.cities.push(label)
      }

      expiringFiles.set(key, expiringFile)
    })
  })

  return [...expiringFiles.values()]
}

export class FileExpirationReminder {
  async call() {
    const expiringFiles = findFilesEndingInOneWeek(
      CITIES,
      formatDate(new Date()),
    )

    if (!expiringFiles.length) {
      return
    }

    const message = expiringFiles
      .map(
        ({ file, endDate, cities }) =>
          `• *${cities.join(', ')}* — \`${file}\` : fin d'activité le ${endDate}`,
      )
      .join('\n')

    await new Slack().sendMessage('#update-needed', message)
  }
}
