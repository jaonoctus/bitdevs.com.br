import type { Dict } from './index'

/** English. Typed as Dict, so it cannot drift out of sync with ./pt. */
export const en: Dict = {
  nav: {
    map: 'Map',
    topics: 'Topics',
    cities: 'Cities',
    whatIs: 'What is BitDevs?',
    language: 'Language',
  },

  hero: {
    eyebrow: 'Brazilian community map',
    titleLead: 'BitDevs across',
    titleAccent: 'Brasil',
    intro:
      'Socratic seminars where developers gather to discuss changes to the Bitcoin protocol and the technologies around it. Find your city on the map.',
    activeCities: 'active cities',
    legendCity: 'City with BitDevs',
    projection: 'Mercator projection',
  },

  map: {
    loading: 'Loading map…',
    interaction: 'Interaction',
    interactionHint: 'hover to see the city, click to open the site',
    credit: 'data · bitdevs-brasil · open source',
    markerLabel: (city, country) => `${city}, ${country} — open site`,
  },

  events: {
    title: 'Upcoming BitDevs',
    announced: 'announced',
    months: [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ],
    weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    today: 'today',
    tomorrow: 'tomorrow',
    inDays: (n) => `in ${n} days`,
    inOneWeek: 'in 1 week',
    inWeeks: (n) => `in ${n} weeks`,
    inMonths: (n) => `in ${n} mo`,
  },

  cities: {
    title: 'Cities with BitDevs',
    growing: 'growing',
    visit: 'visit',
    showAll: (n) => `Show all ${n} cities`,
    showLess: 'Show less',
  },

  topics: {
    eyebrow: 'Community topics feed',
    titleLead: 'What BitDevs is',
    titleAccent: 'discussing',
    intro:
      'Recent Socratic seminar topics aggregated from BitDevs communities across Brasil — cycling through, most active first.',
    empty: 'No topics yet — check back soon.',
    community: 'community',
    communities: 'communities',
    topics: 'topics',
    showAll: (n) => `+ Show all ${n} topics`,
    showLess: '− Show less',
    visitSite: 'visit site ↗',
    paused: 'paused',
    prev: 'Previous community',
    next: 'Next community',
    carousel: 'BitDevs communities',
    agoToday: 'today',
    agoDays: (n) => `${n}d ago`,
    agoWeeks: (n) => `${n}w ago`,
    agoMonths: (n) => `${n}mo ago`,
    agoYears: (n) => `${n}y ago`,
  },

  about: {
    eyebrow: 'About the community',
    titleLead: 'What is',
    titleAccent: 'BitDevs',
    p1: 'BitDevs is a community for those interested in discussing and participating in the research and development of Bitcoin and related protocols. You can be well versed with or new to the topics, all are welcome. Be advised: discussion will be technical.',
    subtitle: 'Socratic Seminars',
    p2: 'Our monthly Socratic Seminar events are formatted to foster debate, information sharing and lively discussion. In the weeks preceding the event, discussion topics are collated by meetup members from a variety of sources: pull requests in popular git repositories (e.g. Bitcoin Core, lnd, c-lightning, Joinmarket, Elements Alpha and Electrum), research papers, technical blog posts, IRC logs, network monitors and more. After a period of discussion, some events will have presentations of open source projects, companies, research and other relevant content. A feedback and Q&A section follow. After the event the group gathers at a nearby restaurant to socialize.',
    p3: 'Each city publishes the discussion topics on its own website. Archives of discussion topics and presentations can be found in the event descriptions of past meetups. The discussion portion of the event is NEVER recorded. It is recommended that you have a firm grasp of the basics of Bitcoin in order to extract the most value from our Socratic events.',
    p4: "To recommend a topic for discussion or present at a future Socratic event, go to the GitHub repository of your city's BitDevs and open your suggestion there. There are different requirements for presentations depending on the nature of the project.",
  },

  footer: {
    promptLead: "Your city isn't on the map yet? Open a Pull Request on",
    repository: 'the repository',
    promptTail: 'with the city, its coordinates and the BitDevs link.',
    github: 'GitHub ↗',
    creditLead: 'by',
    creditWith: 'with',
    creditLove: 'love',
  },

  countries: {
    Brazil: 'Brazil',
  },
}
