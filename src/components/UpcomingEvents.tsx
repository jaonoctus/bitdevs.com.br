import { useMemo } from 'react'
import type { BitDev, EventsIndex } from '../types'
import { countryName, useI18n, type Dict } from '../i18n'
import { dayIndex, todayIndex } from '../day'

interface Props {
  cities: BitDev[]
  events: EventsIndex
}

interface UpcomingItem {
  city: string
  country: string
  siteUrl: string
  title: string
  url: string
  date: string
}

interface MonthGroup {
  label: string
  items: UpcomingItem[]
}

/** Parsed calendar fields for an ISO day, or null when unparseable. */
function dateParts(
  iso: string,
  weekdays: string[],
): { day: number; weekday: string; dayNum: string } | null {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/)
  const day = dayIndex(iso)
  if (!m || day === null) return null
  return {
    day,
    weekday: weekdays[new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])).getUTCDay()],
    dayNum: m[3],
  }
}

function Arrow() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[13px] w-[13px]"
    >
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </svg>
  )
}

/** "today" / "tomorrow" / "in 3 days" / "in 2 weeks" / "in 2 mo". `soon` flags
 * events within a week so the UI can accent them. */
function relative(days: number, t: Dict): { text: string; soon: boolean } {
  const e = t.events
  if (days <= 0) return { text: e.today, soon: true }
  if (days === 1) return { text: e.tomorrow, soon: true }
  if (days < 7) return { text: e.inDays(days), soon: true }
  if (days < 14) return { text: e.inOneWeek, soon: false }
  if (days < 30) return { text: e.inWeeks(Math.round(days / 7)), soon: false }
  return { text: e.inMonths(Math.round(days / 30)), soon: false }
}

export default function UpcomingEvents({ cities, events }: Props) {
  const { t } = useI18n()
  // Recompute only when the fetched events change; "today" is stable per render.
  const today = todayIndex()
  const groups = useMemo<MonthGroup[]>(() => {
    const items = cities
      .map((c): UpcomingItem | null => {
        const entry = events[c.id]
        if (!entry || entry.events.length === 0) return null
        // Soonest upcoming for this community; guard against stale past dates.
        const next = entry.events
          .filter((e) => {
            const p = dateParts(e.date, t.events.weekdays)
            return p !== null && p.day >= today
          })
          .sort((a, b) => a.date.localeCompare(b.date))[0]
        if (!next) return null
        return {
          city: c.city,
          country: c.country,
          siteUrl: c.url,
          title: next.title,
          url: next.url ?? c.url,
          date: next.date,
        }
      })
      .filter((x): x is UpcomingItem => x !== null)
      .sort((a, b) => a.date.localeCompare(b.date))

    // Bucket into months; insertion order stays chronological because items are
    // already sorted, so the Map preserves the right group order.
    const byMonth = new Map<string, MonthGroup>()
    for (const it of items) {
      const m = it.date.match(/^(\d{4})-(\d{2})/)
      if (!m) continue
      const key = `${m[1]}-${m[2]}`
      let group = byMonth.get(key)
      if (!group) {
        group = { label: `${t.events.months[+m[2] - 1]} ${m[1]}`, items: [] }
        byMonth.set(key, group)
      }
      group.items.push(it)
    }
    return [...byMonth.values()]
  }, [cities, events, today, t])

  const total = groups.reduce((n, g) => n + g.items.length, 0)
  if (total === 0) return null

  return (
    <section className="pt-[54px]" id="upcoming">
      <div className="wrap">
        <div className="mb-[26px] flex items-baseline justify-between gap-5">
          <h2 className="m-0 font-sans text-[22px] font-bold tracking-[-0.02em] text-strong">
            {t.events.title}
          </h2>
          <span className="font-mono text-[12.5px] text-muted">
            {String(total).padStart(2, '0')} {t.events.announced}
          </span>
        </div>

        <div className="rounded-[8px] border border-line bg-surface">
          {groups.map((group) => (
            <div key={group.label}>
              <div className="flex items-center gap-4 border-b border-line px-[20px] py-[11px]">
                <h3 className="m-0 font-mono text-[11.5px] font-medium uppercase tracking-[0.14em] text-muted">
                  {group.label}
                </h3>
                <span className="h-px flex-1 bg-line" />
                <span className="font-mono text-[11px] tabular-nums text-faint">
                  {String(group.items.length).padStart(2, '0')}
                </span>
              </div>

              <ul className="m-0 list-none p-0">
                {group.items.map((it, i) => {
                  const parts = dateParts(it.date, t.events.weekdays)
                  const rel = relative(parts ? parts.day - today : 999, t)
                  return (
                    <li
                      key={`${it.city}-${i}`}
                      className="border-b border-line/70 last:border-b-0"
                    >
                      <a
                        href={it.url}
                        target="_blank"
                        rel="noopener"
                        className="group grid grid-cols-[46px_1fr_auto] items-center gap-x-[16px] px-[20px] py-[14px] no-underline outline-none transition-colors duration-150 hover:bg-surface-2 focus-visible:bg-surface-2"
                      >
                        <div className="flex flex-col items-center leading-none">
                          <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-br-yellow">
                            {parts?.weekday}
                          </span>
                          <span className="mt-[3px] font-sans text-[20px] font-bold tracking-[-0.02em] text-strong">
                            {parts?.dayNum}
                          </span>
                        </div>

                        <div className="min-w-0">
                          <div className="truncate">
                            <span className="text-[15px] font-bold tracking-[-0.01em] text-strong">
                              {it.city}
                            </span>
                            <span className="ml-[8px] font-mono text-[10.5px] font-medium uppercase tracking-[0.08em] text-muted">
                              {countryName(t, it.country)}
                            </span>
                          </div>
                          <span className="mt-[2px] block truncate text-[13.5px] leading-snug text-body">
                            {it.title}
                          </span>
                        </div>

                        <div className="flex shrink-0 items-center gap-[12px] pl-[8px]">
                          <span
                            className={`whitespace-nowrap font-mono text-[11px] tracking-[0.04em] ${
                              rel.soon ? 'text-br-yellow' : 'text-faint'
                            }`}
                          >
                            {rel.text}
                          </span>
                          <span className="text-faint transition-colors duration-150 group-hover:text-br-yellow group-focus-visible:text-br-yellow">
                            <Arrow />
                          </span>
                        </div>
                      </a>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
