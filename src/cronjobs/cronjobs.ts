import { NameAndShameService } from '@cronjobs/delation/name-and-shame'
import { HealthCheck } from '@cronjobs/system-health/health-check'
import { schedule } from 'node-cron'

const TIMEZONE = 'Europe/Paris'
export class CronJobsService {
  watch() {
    // https://crontab.guru/#0_8_*_*_1 :)
    schedule(
      // '0 8 * * 5',
      '39 15 * * 6',
      async () => {
        try {
          if (process.env.STOP_TWITTER) { return }
          await new NameAndShameService().call()
        } catch (e) {
          console.error(e)
        }
      },
      {
        timezone: TIMEZONE,
      }
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
      }
    )
  }
}
