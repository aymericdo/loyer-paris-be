import { schedule } from 'node-cron'
import { NameAndShameService } from '@delation/name-and-shame'

export class CronJobsService {
  static watch() {
    // https://crontab.guru/#0_8_*_*_1
    schedule(
      '0 8 * * 4',
      async () => {
        try {
          await new NameAndShameService().send()
        } catch (e) {
          console.error(e)
        }
      },
      {
        timezone: 'Europe/Paris',
      }
    )
  }
}
