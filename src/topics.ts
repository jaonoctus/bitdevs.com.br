import type { BitDev, Topic, TopicsIndex } from './types'

/** One card's worth of topics: a group, and every city it meets in. */
export interface TopicGroup {
  /** City names, in bitdevs.json order. More than one when a group lists
   * several cities on the same site. */
  cities: string[]
  country: string
  siteUrl: string
  date?: string
  topics: Topic[]
}

/** Communities that have topics, newest first. Cities that share a site (and
 * so the same feed and the same topics) are merged into a single group, so the
 * list is not shown once per city. */
export function groupTopics(cities: BitDev[], topics: TopicsIndex): TopicGroup[] {
  const groups = new Map<string, TopicGroup>()
  for (const c of cities) {
    const entry = topics[c.id]
    if (!entry || entry.topics.length === 0) continue
    // Same site but different topics (an explicit per-city source) stays apart.
    const key = `${c.url}\n${JSON.stringify(entry.topics)}`
    const group = groups.get(key)
    if (group) {
      group.cities.push(c.city)
    } else {
      groups.set(key, {
        cities: [c.city],
        country: c.country,
        siteUrl: c.url,
        date: entry.topics[0].date,
        topics: entry.topics,
      })
    }
  }
  return [...groups.values()].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))
}
