import { schedule } from 'node-cron'
import { NameAndShameService } from '@delation/name-and-shame'

export class CronJobsService {
  static watch() {
    // https://crontab.guru/#30_9_*_*_1,3,5
    schedule(
      // '30 9 * * 1,3,5',
      '*/1 * * * * *',
      async () => {
        await new NameAndShameService().send()
      },
      {
        timezone: 'Europe/Paris',
      }
    )
  }
}
