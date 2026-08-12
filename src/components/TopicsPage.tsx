import { useMemo } from 'react'
import type { BitDev, TopicsIndex } from '../types'
import TopicsSpotlight from './TopicsSpotlight'
import { useI18n } from '../i18n'

interface Props {
  cities: BitDev[]
  topics: TopicsIndex
}

export default function TopicsPage({ cities, topics }: Props) {
  const { t } = useI18n()
  const stats = useMemo(() => {
    let communities = 0
    let total = 0
    for (const city of cities) {
      const t = topics[city.id]
      if (t && t.topics.length > 0) {
        communities++
        total += t.topics.length
      }
    }
    return { communities, total }
  }, [cities, topics])

  return (
    <section className="pt-[74px] pb-[80px]" id="topics">
      <div className="wrap max-w-[820px]">
        <div className="max-w-[760px]">
          <p className="m-0 font-mono text-[11.5px] font-medium uppercase tracking-[0.26em] text-br-yellow">
            {t.topics.eyebrow}
          </p>
          <h1 className="mt-[18px] font-sans text-[clamp(34px,5vw,54px)] font-bold leading-[1.04] tracking-[-0.025em] text-strong">
            {t.topics.titleLead} <span className="text-br-yellow">{t.topics.titleAccent}</span>
          </h1>
          <p className="mt-5 max-w-[620px] text-[clamp(15px,1.4vw,18px)] text-pretty text-body">
            {t.topics.intro}
          </p>
        </div>

        {stats.communities === 0 ? (
          <p className="mt-[40px] font-mono text-[13px] text-muted">
            {t.topics.empty}
          </p>
        ) : (
          <>
            <div className="mt-[34px] flex items-baseline gap-x-[26px] gap-y-2 font-mono text-[12.5px] text-muted">
              <span>
                <b className="text-[14px] font-bold text-strong">{stats.communities}</b>{' '}
                {stats.communities === 1 ? t.topics.community : t.topics.communities}
              </span>
              <span className="h-4 w-px bg-line-strong" />
              <span>
                <b className="text-[14px] font-bold text-strong">{stats.total}</b>{' '}
                {t.topics.topics}
              </span>
            </div>

            <TopicsSpotlight cities={cities} topics={topics} />
          </>
        )}
      </div>
    </section>
  )
}
