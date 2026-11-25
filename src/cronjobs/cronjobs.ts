import { FileExpirationReminder } from '@cronjobs/city-config/file-expiration-reminder'
import { NameAndShameStory } from '@cronjobs/instagram/name-and-shame-story'
import { HealthCheck } from '@cronjobs/system-health/health-check'
import { schedule } from 'node-cron'

const TIMEZONE = 'Europe/Paris'
export class CronJobsService {
  watch() {
    schedule(
      '0 8 * * 5',
      async () => {
        try {
          await new NameAndShameStory().call()
        } catch (e) {
          console.error(e)
        }
      },
      {
        timezone: TIMEZONE,
      },
    )

    schedule(
      '0 20 * * *',
      async () => {
        try {
          await new HealthCheck().call()
        } catch (e) {
          console.error(e)
        }
      },
      {
        timezone: TIMEZONE,
      },
    )

    schedule(
      '0 20 * * *',
      async () => {
        try {
          await new FileExpirationReminder().call()
        } catch (e) {
          console.error(e)
        }
      },
      {
        timezone: TIMEZONE,
      },
    )
  }
}
