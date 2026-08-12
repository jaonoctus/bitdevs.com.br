import { useState } from 'react'
import type { BitDev } from '../types'
import { countryName, useI18n } from '../i18n'

// Cities shown before the list is expanded (3 rows of 4 on desktop).
const COLLAPSED_COUNT = 12

interface Props {
  cities: BitDev[]
  activeIndex: number | null
  onHover: (index: number | null) => void
}

function ArrowIcon() {
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

export default function CityIndex({ cities, activeIndex, onHover }: Props) {
  const { t } = useI18n()
  const [expanded, setExpanded] = useState(false)
  const n = cities.length
  const canCollapse = n > COLLAPSED_COUNT
  const visible = expanded || !canCollapse ? cities : cities.slice(0, COLLAPSED_COUNT)

  return (
    <section className="pt-[54px] pb-[70px]" id="cities">
      <div className="wrap">
        <div className="mb-[22px] flex items-baseline justify-between gap-5">
          <h2 className="m-0 font-sans text-[22px] font-bold tracking-[-0.02em] text-strong">
            {t.cities.title}
          </h2>
          <span className="font-mono text-[12.5px] text-muted">
            {String(n).padStart(2, '0')} / {t.cities.growing}
          </span>
        </div>

        <div className="grid gap-[14px] [grid-template-columns:repeat(auto-fill,minmax(260px,1fr))]">
          {visible.map((d, i) => (
            <a
              key={`${d.city}-${i}`}
              href={d.url}
              target="_blank"
              rel="noopener"
              data-active={activeIndex === i || undefined}
              onMouseEnter={() => onHover(i)}
              onMouseLeave={() => onHover(null)}
              onFocus={() => onHover(i)}
              onBlur={() => onHover(null)}
              className="group flex items-center justify-between gap-[14px] rounded-[6px] border border-line bg-surface p-[18px] no-underline outline-none transition-[border-color,background] duration-200 hover:border-br-yellow-600 hover:bg-surface-2 focus-visible:border-br-yellow-600 focus-visible:bg-surface-2 data-[active]:border-br-yellow-600 data-[active]:bg-surface-2"
            >
              <span className="flex min-w-0 items-center gap-[13px]">
                <span className="h-[9px] w-[9px] shrink-0 rounded-full bg-br-yellow shadow-[0_0_0_3px_rgba(255,223,0,0.16)]" />
                <span className="min-w-0">
                  <span className="block text-base font-bold tracking-[-0.01em] text-strong">
                    {d.city}
                  </span>
                  <span className="mt-[3px] block font-mono text-[11px] uppercase tracking-[0.08em] text-muted">
                    {countryName(t, d.country)}
                  </span>
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-[6px] font-mono text-[11px] tracking-[0.06em] text-faint transition-colors duration-200 group-hover:text-br-yellow group-focus-visible:text-br-yellow">
                {t.cities.visit} <ArrowIcon />
              </span>
            </a>
          ))}
        </div>

        {canCollapse && (
          <div className="mt-7 flex justify-center">
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
              className="rounded-[6px] border border-line px-5 py-3 font-mono text-[12px] uppercase tracking-[0.06em] text-muted transition-colors duration-200 hover:border-line-strong hover:text-strong"
            >
              {expanded ? 'Show less' : `Show all ${n} cities`}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
