import { findFilesEndingInOneWeek } from '../file-expiration-reminder'

describe('findFilesEndingInOneWeek', () => {
  it('finds periods ending seven days from today', () => {
    const files = findFilesEndingInOneWeek(
      {
        paris: {
          label: 'Paris',
          rentControlPeriods: [
            {
              start: '2025-07-01',
              end: '2026-06-30',
              file: 'paris.json',
            },
          ],
        },
      },
      '2026-06-23',
    )

    expect(files).toEqual([
      {
        file: 'paris.json',
        endDate: '2026-06-30',
        cities: ['Paris'],
      },
    ])
  })

  it('uses one year after start when end is missing', () => {
    const files = findFilesEndingInOneWeek(
      {
        paris: {
          label: 'Paris',
          rentControlPeriods: [
            {
              start: '2025-06-30',
              file: 'paris.json',
            },
          ],
        },
      },
      '2026-06-23',
    )

    expect(files[0].endDate).toBe('2026-06-30')
  })

  it('uses end rather than the calculated start date and excludes other days', () => {
    const cities = {
      paris: {
        label: 'Paris',
        rentControlPeriods: [
          {
            start: '2025-06-23',
            end: '2026-07-01',
            file: 'paris.json',
          },
        ],
      },
    }

    expect(findFilesEndingInOneWeek(cities, '2026-06-23')).toEqual([])
    expect(findFilesEndingInOneWeek(cities, '2026-06-24')).toHaveLength(1)
  })

  it('groups the same file and end date across cities', () => {
    const files = findFilesEndingInOneWeek(
      {
        paris: {
          label: 'Paris',
          rentControlPeriods: [{ end: '2026-06-30', file: 'shared.json' }],
        },
        lyon: {
          label: 'Lyon',
          rentControlPeriods: [{ end: '2026-06-30', file: 'shared.json' }],
        },
      },
      '2026-06-23',
    )

    expect(files).toEqual([
      {
        file: 'shared.json',
        endDate: '2026-06-30',
        cities: ['Paris', 'Lyon'],
      },
    ])
  })

  it('ignores periods without either date', () => {
    expect(
      findFilesEndingInOneWeek(
        {
          paris: {
            label: 'Paris',
            rentControlPeriods: [{ file: 'paris.json' }],
          },
        },
        '2026-06-23',
      ),
    ).toEqual([])
  })
})
