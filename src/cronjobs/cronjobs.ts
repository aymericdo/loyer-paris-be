import { schedule } from 'node-cron'
import { NameAndShameService } from '@cronjobs/delation/name-and-shame'
import { HealthCheck } from '@cronjobs/system-health/health-check'

const TIMEZONE = 'Europe/Paris'
export class CronJobsService {
  
  static watch() {
    // https://crontab.guru/#0_8_*_*_1
    schedule(
      '0 8 * * 5',
      async () => {
        try {
          await new NameAndShameService().send()
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
          await new HealthCheck().check()
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
