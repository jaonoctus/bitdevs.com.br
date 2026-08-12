import { useI18n } from '../i18n'

// Prose column: the same 820px wrap and heading rhythm as TopicsPage, so the
// two standalone routes read as the same kind of page.
export default function AboutPage() {
  const { t } = useI18n()

  return (
    <section className="pt-[74px] pb-[80px]" id="about">
      <div className="wrap max-w-[820px]">
        <div className="max-w-[760px]">
          <p className="m-0 font-mono text-[11.5px] font-medium uppercase tracking-[0.26em] text-br-yellow">
            {t.about.eyebrow}
          </p>
          <h1 className="mt-[18px] font-sans text-[clamp(34px,5vw,54px)] font-bold leading-[1.04] tracking-[-0.025em] text-strong">
            {t.about.titleLead} <span className="text-br-yellow">{t.about.titleAccent}</span>
          </h1>
        </div>

        <p className="mt-6 max-w-[720px] text-[clamp(15px,1.4vw,18px)] leading-[1.65] text-pretty text-body">
          {t.about.p1}
        </p>

        <h2 className="mt-[46px] font-sans text-[22px] font-bold tracking-[-0.02em] text-strong">
          {t.about.subtitle}
        </h2>

        <div className="mt-[18px] flex flex-col gap-[18px] text-[15px] leading-[1.7] text-pretty text-body">
          <p className="m-0">{t.about.p2}</p>
          <p className="m-0">{t.about.p3}</p>
          <p className="m-0">{t.about.p4}</p>
        </div>
      </div>
    </section>
  )
}
