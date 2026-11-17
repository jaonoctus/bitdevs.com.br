/**
 * Upcoming-events aggregator (git-scraping).
 *
 * Walks every community in src/data/bitdevs.json, fetches its homepage, and
 * extracts the *upcoming* meetings from the shared static-site template most
 * BitDevs groups use — an "Upcoming and Recent Events" list where each entry is
 * a date, a » separator, and a linked title. Only events dated today or later
 * are kept. The merged result is written to src/data/events.json, mirroring the
 * topics pipeline: a GitHub Action cron publishes it to the `data` branch and
 * the app fetches it at runtime.
 *
 * Two template variants are handled:
 *   - Home-posts:  <div class="Home-posts-post"><span class="...-date">DD Mon
 *                  YYYY</span> &raquo; <a class="...-title" href>Title</a></div>
 *   - posts/time:  <li><time>DD Mon YYYY</time> » <a href>Title</a></li>
 *
 * Run locally: bun run scripts/aggregate-events.ts
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import type { BitDev, NextEvent, EventsIndex } from '../src/types'
import { MS_PER_DAY, todayIndex } from '../src/day.ts'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const BITDEVS_PATH = join(root, 'src/data/bitdevs.json')
const EVENTS_PATH = join(root, 'src/data/events.json')
const ICS_PATH = join(root, 'src/data/events.ics')

/** Max upcoming events kept per community. */
const MAX_EVENTS = 4
/** Concurrent community fetches. */
const CONCURRENCY = 12
/** Hosts that never carry the events template (social, meetup, code hosts). */
const SKIP_HOSTS = [
  'x.com', 'twitter.com', 'mobile.twitter.com', 'nitter.net',
  'meetup.com', 'github.com', 't.me', 'discord.gg', 'discord.com',
]
/** Titles that mark an event as not actually taking place. */
const CANCELLED = /(not happening|cancell?ed|postponed|no habr[aá]|suspend)/i
const UA = 'bitdevsmap-aggregator'

// --- generic helpers -------------------------------------------------------

const NAMED_ENTITIES: Record<string, string> = {
  '&lt;': '<', '&gt;': '>', '&quot;': '"', '&apos;': "'", '&nbsp;': ' ',
  '&rsquo;': '’', '&lsquo;': '‘', '&rdquo;': '”', '&ldquo;': '“',
  '&mdash;': '—', '&ndash;': '–', '&hellip;': '…', '&deg;': '°',
  '&raquo;': '»', '&laquo;': '«',
}

function decodeEntities(s: string): string {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&(?:lt|gt|quot|apos|nbsp|rsquo|lsquo|rdquo|ldquo|mdash|ndash|hellip|deg|raquo|laquo);/g,
      (m) => NAMED_ENTITIES[m] ?? m)
    .replace(/&amp;/g, '&')
}

function stripTags(html: string): string {
  return decodeEntities(html.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim()
}

function absolute(href: string, base: string): string {
  try {
    return new URL(href, base).href
  } catch {
    return href
  }
}

const hostOfUrl = (url: string): string => {
  try {
    return new URL(url).host.replace(/^www\./, '')
  } catch {
    return ''
  }
}

async function fetchText(url: string, timeoutMs = 10_000): Promise<string> {
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: 'text/html,*/*' },
    redirect: 'follow',
    signal: AbortSignal.timeout(timeoutMs),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.text()
}

async function pool<T, R>(items: T[], worker: (item: T) => Promise<R>, concurrency: number): Promise<R[]> {
  const results = new Array<R>(items.length)
  let next = 0
  const run = async () => {
    while (next < items.length) {
      const i = next++
      results[i] = await worker(items[i])
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, run))
  return results
}

// --- date parsing ----------------------------------------------------------

const MONTHS: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
}

interface ParsedDate {
  /** Whole-day index, for cheap today/future comparison. */
  day: number
  /** ISO calendar day, YYYY-MM-DD. */
  iso: string
}

function makeDay(year: number, month: number, date: number): ParsedDate | null {
  const t = Date.UTC(year, month, date)
  if (Number.isNaN(t)) return null
  return { day: Math.floor(t / MS_PER_DAY), iso: new Date(t).toISOString().slice(0, 10) }
}

/** Parse the date formats seen across the shared template. */
function parseEventDate(raw: string): ParsedDate | null {
  const s = raw.trim()
  // ISO: 2026-06-24
  let m = s.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (m) return makeDay(+m[1], +m[2] - 1, +m[3])
  // Day-first: "03 Sep 2026", "9 Jul 2026", "8. Jul, 2026"
  m = s.match(/^(\d{1,2})\.?\s+([A-Za-z]{3,})\.?,?\s+(\d{4})$/)
  if (m) {
    const mon = MONTHS[m[2].slice(0, 3).toLowerCase()]
    if (mon !== undefined) return makeDay(+m[3], mon, +m[1])
  }
  // Month-first: "March 12, 2026"
  m = s.match(/^([A-Za-z]{3,})\.?\s+(\d{1,2}),?\s+(\d{4})$/)
  if (m) {
    const mon = MONTHS[m[1].slice(0, 3).toLowerCase()]
    if (mon !== undefined) return makeDay(+m[3], mon, +m[2])
  }
  return null
}

// --- extraction ------------------------------------------------------------

interface RawEvent extends NextEvent {
  day: number
}

/** Pull a date + title from one event block (a Home-posts-post div or a
 * posts <li>). Returns null when the block has no parseable date. */
function parseBlock(block: string, baseUrl: string): RawEvent | null {
  const dateRaw =
    block.match(/<time[^>]*>([\s\S]*?)<\/time>/i)?.[1] ??
    block.match(/Home-posts-post-date[^>]*>([\s\S]*?)<\/span/i)?.[1] ??
    ''
  const parsed = parseEventDate(stripTags(dateRaw))
  if (!parsed) return null

  const anchor = block.match(/<a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/i)
  const title = stripTags(anchor ? anchor[2] : block).replace(/^»\s*/, '').trim()
  if (!title || title.length > 200) return null

  // A scraped anchor can carry any scheme new URL() accepts (e.g. javascript:),
  // which would be rendered as a live href. Only trust http(s); baseUrl comes
  // from bitdevs.json and is already http(s).
  const url = anchor ? absolute(decodeEntities(anchor[1]), baseUrl) : baseUrl
  if (!/^https?:\/\//i.test(url)) return null
  return { title, url, date: parsed.iso, day: parsed.day }
}

/** Extract upcoming events (day >= today) from a homepage, soonest first. */
function extractUpcoming(html: string, baseUrl: string, today: number): NextEvent[] {
  const blocks: string[] = []
  const homePostRe = /<div[^>]*class=["'][^"']*Home-posts-post\b[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi
  for (let m; (m = homePostRe.exec(html)); ) blocks.push(m[1])
  const liRe = /<li[^>]*>([\s\S]*?)<\/li>/gi
  for (let m; (m = liRe.exec(html)); ) if (/<time[\s>]/i.test(m[1])) blocks.push(m[1])

  const seen = new Set<string>()
  const upcoming: RawEvent[] = []
  for (const block of blocks) {
    const ev = parseBlock(block, baseUrl)
    if (!ev || ev.day < today || CANCELLED.test(ev.title)) continue
    const key = `${ev.date}|${ev.title.toLowerCase()}`
    if (seen.has(key)) continue
    seen.add(key)
    upcoming.push(ev)
  }
  return upcoming
    .sort((a, b) => a.day - b.day)
    .slice(0, MAX_EVENTS)
    .map(({ day: _day, ...ev }) => ev)
}

// --- iCalendar -------------------------------------------------------------

/** Escape a TEXT value per RFC 5545 §3.3.11. */
function icsEscape(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n')
}

/** Fold a content line at 75 octets without splitting a UTF-8 sequence
 * (RFC 5545 §3.1). Continuation lines start with a single space. */
function icsFold(line: string): string {
  const encoder = new TextEncoder()
  const parts: string[] = []
  let current = ''
  let bytes = 0
  for (const char of line) {
    const size = encoder.encode(char).length
    const cap = parts.length === 0 ? 75 : 74
    if (bytes + size > cap) {
      parts.push(parts.length === 0 ? current : ` ${current}`)
      current = char
      bytes = size
    } else {
      current += char
      bytes += size
    }
  }
  parts.push(parts.length === 0 ? current : ` ${current}`)
  return parts.join('\r\n')
}

const ymd = (iso: string): string => iso.slice(0, 10).replace(/-/g, '')

const nextYmd = (iso: string): string =>
  ymd(new Date(Date.parse(`${iso.slice(0, 10)}T00:00:00Z`) + MS_PER_DAY).toISOString())

const stamp = (d: Date): string => d.toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '')

/** One VEVENT per upcoming meeting, all-day (the sites publish a date, not a
 * time; a per-community start time would need a new field in bitdevs.json). */
function buildIcs(index: EventsIndex, cities: BitDev[], now: Date): string {
  const byId = new Map(cities.map((c) => [c.id, c]))
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//BitDevs Brasil//bitdevs.com.br//PT-BR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:BitDevs Brasil',
    'X-WR-CALDESC:Próximos encontros dos grupos BitDevs no Brasil',
    'X-WR-TIMEZONE:America/Sao_Paulo',
    'REFRESH-INTERVAL;VALUE=DURATION:PT6H',
    'X-PUBLISHED-TTL:PT6H',
  ]
  const dtstamp = stamp(now)
  // Chronological, so a client that shows the file as-is reads like an agenda.
  const items: Array<{ id: string; name: string; siteUrl?: string; ev: NextEvent }> = []
  for (const [id, entry] of Object.entries(index)) {
    const city = byId.get(id)
    for (const ev of entry.events) {
      items.push({ id, name: city?.city ?? id, siteUrl: city?.url, ev })
    }
  }
  items.sort((a, b) => a.ev.date.localeCompare(b.ev.date) || a.name.localeCompare(b.name, 'pt-BR'))

  for (const { id, name, siteUrl, ev } of items) {
    lines.push(
      'BEGIN:VEVENT',
      `UID:${id}-${ymd(ev.date)}@bitdevs.com.br`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART;VALUE=DATE:${ymd(ev.date)}`,
      `DTEND;VALUE=DATE:${nextYmd(ev.date)}`,
      `SUMMARY:${icsEscape(`${ev.title} — ${name}`)}`,
      `LOCATION:${icsEscape(siteUrl ? `${name}, Brazil` : name)}`,
      `DESCRIPTION:${icsEscape(`${ev.title}, no BitDevs ${name}.${siteUrl ? ` Site do grupo: ${siteUrl}` : ''}`)}`,
      `URL:${ev.url}`,
      'TRANSP:TRANSPARENT',
      'END:VEVENT',
    )
  }
  lines.push('END:VCALENDAR')
  return lines.map(icsFold).join('\r\n') + '\r\n'
}

// --- orchestration ---------------------------------------------------------

interface Outcome {
  city: BitDev
  events?: NextEvent[]
  skipped?: string
  error?: string
}

async function main() {
  const cities = JSON.parse(readFileSync(BITDEVS_PATH, 'utf8')) as BitDev[]
  const fetchedAt = new Date().toISOString()
  // Brazilian day: a run just after 00:00 UTC is still the previous evening in
  // São Paulo and must not drop an event happening later that same day.
  const today = todayIndex()
  let previous: EventsIndex = {}
  try {
    previous = JSON.parse(readFileSync(EVENTS_PATH, 'utf8')) as EventsIndex
  } catch {
    // No previous file yet (first run) — nothing to fall back to.
  }

  let done = 0
  const report = (o: Outcome): Outcome => {
    done++
    const tag = o.events?.length
      ? `ok (${o.events.length}) next ${o.events[0].date}`
      : o.error
        ? `err ${o.error}`
        : `none${o.skipped ? ` (${o.skipped})` : ''}`
    console.log(`[${String(done).padStart(2)}/${cities.length}] ${o.city.city}: ${tag}`)
    return o
  }

  const outcomes = await pool<BitDev, Outcome>(
    cities,
    async (city) => {
      const host = hostOfUrl(city.url)
      if (!host || SKIP_HOSTS.some((h) => host === h || host.endsWith(`.${h}`))) {
        return report({ city, skipped: 'non-website' })
      }
      try {
        const html = await fetchText(city.url)
        return report({ city, events: extractUpcoming(html, city.url, today) })
      } catch (err) {
        return report({ city, error: (err as Error).message })
      }
    },
    CONCURRENCY,
  )

  // Rebuild from scratch, but on a genuine fetch error fall back to the last
  // published entry (a network blip must not erase a community). Skips and
  // "no upcoming" are real results and are intentionally not carried over.
  // Carried-over events are pruned to still-future dates so the file never
  // publishes stale past meetings.
  const index: EventsIndex = {}
  for (const o of outcomes) {
    if (o.events && o.events.length > 0) {
      index[o.city.id] = { id: o.city.id, fetchedAt, events: o.events }
    } else if (o.error && previous[o.city.id]) {
      const kept = previous[o.city.id].events.filter((e) => {
        const p = parseEventDate(e.date)
        return p !== null && p.day >= today
      })
      if (kept.length > 0) index[o.city.id] = { ...previous[o.city.id], events: kept }
    }
  }

  const sorted: EventsIndex = {}
  for (const key of Object.keys(index).sort()) sorted[key] = index[key]
  writeFileSync(EVENTS_PATH, JSON.stringify(sorted, null, 2) + '\n')

  // Same data as a subscribe-able calendar; the cron publishes it next to
  // events.json on the `data` branch.
  const ics = buildIcs(sorted, cities, new Date())
  writeFileSync(ICS_PATH, ics)

  // --- coverage report -----------------------------------------------------
  const withEvents = outcomes.filter((o) => o.events && o.events.length > 0)
  const errored = outcomes.filter((o) => o.error)
  const flat: Array<{ city: string; ev: NextEvent }> = []
  for (const o of withEvents) for (const ev of o.events!) flat.push({ city: o.city.city, ev })
  flat.sort((a, b) => a.ev.date.localeCompare(b.ev.date))

  console.log(
    `\nCoverage: ${withEvents.length}/${cities.length} communities have an upcoming event`,
  )
  console.log(`  skipped: ${outcomes.filter((o) => o.skipped).length}, errored: ${errored.length}`)
  console.log('\nUpcoming events (soonest first):')
  for (const { city, ev } of flat) console.log(`  ${ev.date}  ${city.padEnd(20)} ${ev.title}`)
  if (errored.length) {
    console.log('\nerrors:')
    for (const o of errored) console.log(`  ${o.city.city}: ${o.error}`)
  }
  console.log(`\nWrote ${EVENTS_PATH}`)
  console.log(`Wrote ${ICS_PATH} (${(ics.match(/BEGIN:VEVENT/g) ?? []).length} events)`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
