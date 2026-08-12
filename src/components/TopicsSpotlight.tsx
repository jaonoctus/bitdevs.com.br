import { useEffect, useMemo, useState } from 'react'
import type { BitDev, TopicsIndex } from '../types'
import { countryName, useI18n, type Dict } from '../i18n'
import { dayIndex, todayIndex } from '../day'

// Topics shown per community before "Show all".
const PREVIEW = 3
// Auto-advance interval (ms).
const INTERVAL = 6000

interface Community {
  city: string
  country: string
  siteUrl: string
  date?: string
  topics: { title: string; url?: string }[]
}

interface Props {
  cities: BitDev[]
  topics: TopicsIndex
}

/** "in 3 days" while the seminar is still ahead, "2w ago" once it has passed.
 * Feeds publish the entry for an upcoming seminar, so a future date is normal
 * and must not collapse to "today" — the home page calls the same day tomorrow. */
function timeAgo(iso: string | undefined, t: Dict): string {
  if (!iso) return ''
  const day = dayIndex(iso)
  if (day === null) return ''
  const days = todayIndex() - day
  if (days < 0) {
    const ahead = -days
    if (ahead === 1) return t.events.tomorrow
    if (ahead < 7) return t.events.inDays(ahead)
    if (ahead < 14) return t.events.inOneWeek
    if (ahead < 30) return t.events.inWeeks(Math.round(ahead / 7))
    return t.events.inMonths(Math.round(ahead / 30))
  }
  if (days < 1) return t.topics.agoToday
  if (days < 7) return t.topics.agoDays(days)
  const weeks = Math.floor(days / 7)
  if (weeks < 5) return t.topics.agoWeeks(weeks)
  const months = Math.floor(days / 30)
  if (months < 12) return t.topics.agoMonths(months)
  return t.topics.agoYears(Math.floor(days / 365))
}

function Chevron({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
      strokeLinecap="round" strokeLinejoin="round" className="h-[15px] w-[15px]">
      <path d={dir === 'left' ? 'M15 6 9 12l6 6' : 'M9 6l6 6-6 6'} />
    </svg>
  )
}

export default function TopicsSpotlight({ cities, topics }: Props) {
  const { t } = useI18n()
  const communities = useMemo<Community[]>(
    () =>
      cities
        .map((c): Community | null => {
          const entry = topics[c.id]
          if (!entry || entry.topics.length === 0) return null
          return { city: c.city, country: c.country, siteUrl: c.url, date: entry.topics[0].date, topics: entry.topics }
        })
        .filter((c): c is Community => c !== null)
        .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? '')),
    [cities, topics],
  )

  const n = communities.length
  const [idx, setIdx] = useState(0)
  const [expanded, setExpanded] = useState(false)
  const [hovering, setHovering] = useState(false)
  const [focused, setFocused] = useState(false)
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduced(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  // Rotation freezes while expanded ("Show all"), on hover/keyboard focus, or
  // reduced motion — otherwise a focused link is lost when the slide remounts.
  const paused = expanded || hovering || focused || reduced

  useEffect(() => {
    if (paused || n <= 1) return
    const timer = setTimeout(() => setIdx((i) => (i + 1) % n), INTERVAL)
    return () => clearTimeout(timer)
  }, [paused, n, idx])

  if (n === 0) return null

  const safeIdx = idx % n
  const cur = communities[safeIdx]
  const shown = expanded ? cur.topics : cur.topics.slice(0, PREVIEW)
  const hasMore = cur.topics.length > PREVIEW

  const go = (delta: number) => {
    setExpanded(false)
    setIdx((i) => (i + delta + n) % n)
  }

  return (
    <div
      className="mt-[22px]"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      role="region"
      aria-roledescription="carousel"
      aria-label={t.topics.carousel}
    >
      {/* auto-advance progress */}
      <div className="mb-[14px] h-[2px] w-full overflow-hidden rounded bg-line">
        <div
          key={paused ? 'paused' : safeIdx}
          className="h-full w-full origin-left bg-br-yellow"
          style={paused ? { transform: 'scaleX(0)' } : { animation: `topic-progress ${INTERVAL}ms linear forwards` }}
        />
      </div>

      <article
        key={safeIdx}
        className="rounded-[8px] border border-line bg-surface p-[22px] [animation:topic-in_0.32s_var(--ease)]"
      >
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="m-0 font-sans text-[18px] font-bold tracking-[-0.02em] text-strong">
            {cur.city}
            <span className="ml-[10px] font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-muted">
              {countryName(t, cur.country)}
            </span>
          </h3>
          <span className="shrink-0 whitespace-nowrap font-mono text-[11px] tracking-[0.04em] text-faint">
            {timeAgo(cur.date, t)}
          </span>
        </div>

        <ul className="m-0 mt-[16px] flex list-none flex-col gap-[11px] p-0">
          {shown.map((topic, i) => (
            <li key={`${topic.title}-${i}`} className="flex items-start gap-[11px]">
              <span className="mt-[7px] h-[6px] w-[6px] shrink-0 rounded-full bg-br-yellow" />
              {topic.url ? (
                <a
                  href={topic.url}
                  target="_blank"
                  rel="noopener"
                  className="text-[14.5px] leading-snug text-body no-underline transition-colors duration-150 hover:text-br-yellow"
                >
                  {topic.title}
                </a>
              ) : (
                <span className="text-[14.5px] leading-snug text-body">{topic.title}</span>
              )}
            </li>
          ))}
        </ul>

        <div className="mt-[18px] flex items-center justify-between gap-4 border-t border-line pt-[15px]">
          {hasMore ? (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
              className="font-mono text-[11px] uppercase tracking-[0.06em] text-br-yellow transition-colors duration-150 hover:text-br-yellow-300"
            >
              {expanded ? t.topics.showLess : t.topics.showAll(cur.topics.length)}
            </button>
          ) : (
            <span />
          )}
          <a
            href={cur.siteUrl}
            target="_blank"
            rel="noopener"
            className="font-mono text-[11px] tracking-[0.04em] text-muted transition-colors duration-150 hover:text-strong"
          >
            {t.topics.visitSite}
          </a>
        </div>
      </article>

      {/* controls */}
      <div className="mt-[16px] flex items-center justify-center gap-[20px] font-mono text-[12px] text-muted">
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label={t.topics.prev}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-muted transition-colors duration-150 hover:border-line-strong hover:text-strong"
        >
          <Chevron dir="left" />
        </button>
        <span className="tabular-nums tracking-[0.08em]">
          <b className="text-strong">{String(safeIdx + 1).padStart(2, '0')}</b>
          <span className="text-faint"> / {n}</span>
          {paused && <span className="ml-[10px] text-faint">{t.topics.paused}</span>}
        </span>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label={t.topics.next}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-muted transition-colors duration-150 hover:border-line-strong hover:text-strong"
        >
          <Chevron dir="right" />
        </button>
      </div>
    </div>
  )
}
