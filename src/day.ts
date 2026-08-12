/**
 * Calendar-day arithmetic for the whole app, anchored to Brazil.
 *
 * Every date in the data files is a *calendar day*, not an instant: a seminar
 * on 2026-08-20 is on the 20th for everyone reading the site. So days are
 * compared as whole-day indexes, and "today" is the day it is in São Paulo —
 * not in UTC, which is three hours ahead and would call an event "hoje" from
 * 21:00 the evening before.
 */

export const MS_PER_DAY = 86_400_000

/** Whole-day index of a Y/M/D triple (UTC is just the arithmetic base here). */
function indexOf(year: number, month: number, day: number): number {
  return Math.floor(Date.UTC(year, month - 1, day) / MS_PER_DAY)
}

const saoPaulo = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/Sao_Paulo',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

/** Today's day index in São Paulo. */
export function todayIndex(at: Date = new Date()): number {
  const parts: Record<string, string> = {}
  for (const p of saoPaulo.formatToParts(at)) parts[p.type] = p.value
  return indexOf(+parts.year, +parts.month, +parts.day)
}

/** Day index for a date from the data files, or null when unparseable.
 * The leading YYYY-MM-DD is read as written — both a bare `2026-08-20` (events)
 * and a feed timestamp like `2026-08-20T00:00:00.000Z` (topics) carry the day
 * the publisher meant, and re-projecting the latter through a timezone would
 * shift midnight-stamped posts a day off. */
export function dayIndex(iso: string): number | null {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/)
  return m ? indexOf(+m[1], +m[2], +m[3]) : null
}
