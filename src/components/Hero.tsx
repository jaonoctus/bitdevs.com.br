import { useI18n } from '../i18n'

export default function Hero({ count }: { count: number }) {
  const { t } = useI18n()

  return (
    <section className="pt-[74px] pb-[30px]" id="map">
      <div className="wrap">
        <div>
          <p className="m-0 font-mono text-[11.5px] font-medium uppercase tracking-[0.26em] text-br-yellow">
            {t.hero.eyebrow}
          </p>
          {/* No forced break — the headline wraps on its own at narrow widths. */}
          <h1 className="mt-[18px] font-sans text-[clamp(40px,6vw,68px)] font-bold leading-[1.02] tracking-[-0.025em] text-balance text-strong">
            {t.hero.titleLead}{' '}
            <span className="text-br-blue-400">{t.hero.titleAccent}</span>
          </h1>
          <p className="mt-5 text-[clamp(16px,1.5vw,19px)] text-pretty text-body">
            {t.hero.intro}
          </p>
        </div>

        <div className="mt-[30px] flex flex-wrap items-center gap-x-[26px] gap-y-[14px] font-mono text-[12.5px] text-muted">
          <span className="flex items-baseline gap-2">
            <b className="text-[15px] font-bold text-strong">{count}</b> {t.hero.activeCities}
          </span>
          <span className="h-4 w-px bg-line-strong" />
          <span className="flex items-center gap-[9px]">
            <span className="h-[11px] w-[11px] rounded-full bg-br-yellow shadow-[0_0_0_4px_rgba(255,223,0,0.16)]" />
            {t.hero.legendCity}
          </span>
          <span className="h-4 w-px bg-line-strong" />
          <span>{t.hero.projection}</span>
        </div>
      </div>
    </section>
  )
}
