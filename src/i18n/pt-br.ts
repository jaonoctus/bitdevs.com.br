/**
 * Brazilian Portuguese — the source of truth for the UI copy.
 *
 * `Dict` in ./index is `typeof ptBR`, so every other locale is checked against
 * this shape: adding a key here breaks the build until each locale supplies it.
 * Anything that interpolates a value is a function rather than a template with
 * placeholders, so word order stays the translator's choice.
 */
export const ptBR = {
  nav: {
    map: 'Mapa',
    topics: 'Pautas',
    cities: 'Cidades',
    whatIs: 'O que é BitDevs?',
    language: 'Idioma',
  },

  hero: {
    eyebrow: 'Mapa da comunidade brasileira',
    titleLead: 'BitDevs pelo',
    titleAccent: 'Brasil',
    intro:
      'Seminários socráticos onde desenvolvedores se reúnem para discutir mudanças no protocolo Bitcoin e nas tecnologias ao seu redor. Encontre sua cidade no mapa.',
    activeCities: 'cidades ativas',
    legendCity: 'Cidade com BitDevs',
    projection: 'Projeção de Mercator',
  },

  map: {
    loading: 'Carregando mapa…',
    interaction: 'Interação',
    interactionHint: 'passe o mouse para ver a cidade, clique para abrir o site',
    credit: 'dados · bitdevs-brasil · código aberto',
    markerLabel: (city: string, country: string) => `${city}, ${country} — abrir site`,
  },

  events: {
    title: 'Próximos BitDevs',
    announced: 'anunciados',
    months: [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
    ],
    /** Sunday first, to be indexed by Date#getUTCDay. */
    weekdays: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
    today: 'hoje',
    tomorrow: 'amanhã',
    inDays: (n: number) => `em ${n} dias`,
    inOneWeek: 'em 1 semana',
    inWeeks: (n: number) => `em ${n} semanas`,
    inMonths: (n: number) => `em ${n} meses`,
  },

  cities: {
    title: 'Cidades com BitDevs',
    growing: 'crescendo',
    visit: 'visitar',
    showAll: (n: number) => `Ver todas as ${n} cidades`,
    showLess: 'Ver menos',
  },

  topics: {
    eyebrow: 'Pautas das comunidades',
    titleLead: 'O que os BitDevs estão',
    titleAccent: 'discutindo',
    intro:
      'Pautas recentes dos seminários socráticos, agregadas das comunidades BitDevs pelo Brasil — em rotação, das mais ativas primeiro.',
    empty: 'Ainda não há pautas — volte em breve.',
    community: 'comunidade',
    communities: 'comunidades',
    topics: 'pautas',
    showAll: (n: number) => `+ Ver todas as ${n} pautas`,
    showLess: '− Ver menos',
    visitSite: 'visitar site ↗',
    paused: 'pausado',
    prev: 'Comunidade anterior',
    next: 'Próxima comunidade',
    carousel: 'Comunidades BitDevs',
    agoToday: 'hoje',
    agoDays: (n: number) => `${n}d atrás`,
    agoWeeks: (n: number) => `${n}sem atrás`,
    agoMonths: (n: number) => `${n}m atrás`,
    agoYears: (n: number) => `${n}a atrás`,
  },

  /** Whole paragraphs, in render order, so the translator owns the sentences. */
  about: {
    eyebrow: 'Sobre a comunidade',
    titleLead: 'O que é',
    titleAccent: 'BitDevs',
    p1: 'BitDevs é uma comunidade para quem tem interesse em discutir e participar da pesquisa e do desenvolvimento do Bitcoin e dos protocolos relacionados. Você pode já dominar os temas ou estar chegando agora, todos são bem-vindos. Atenção: as discussões são técnicas.',
    subtitle: 'Seminários Socráticos',
    p2: 'Nossos seminários socráticos mensais são formatados para estimular o debate, a troca de informações e a discussão animada. Nas semanas que antecedem o encontro, os temas da discussão são reunidos pelos participantes a partir de fontes variadas: pull requests em repositórios git populares (por exemplo Bitcoin Core, lnd, c-lightning, Joinmarket, Elements Alpha e Electrum), artigos de pesquisa, posts técnicos em blogs, logs de IRC, monitores da rede e mais. Depois de um período de discussão, alguns encontros têm apresentações de projetos de código aberto, empresas, pesquisas e outros conteúdos relevantes. Em seguida vem uma seção de feedback e perguntas. Ao final, o grupo se reúne em um restaurante próximo para confraternizar.',
    p3: 'Cada cidade publica os temas da discussão no próprio site. Os arquivos de temas e apresentações ficam nas descrições dos encontros anteriores. A parte de discussão do encontro NUNCA é gravada. Recomendamos ter uma base sólida dos fundamentos do Bitcoin para extrair o máximo dos nossos seminários socráticos.',
    p4: 'Para sugerir um tema de discussão ou apresentar em um seminário futuro, acesse o repositório no GitHub do BitDevs da sua cidade e abra sua sugestão por lá. Os requisitos para apresentação variam conforme a natureza do projeto.',
  },

  footer: {
    promptLead: 'Sua cidade ainda não está no mapa? Abra um Pull Request no',
    repository: 'repositório',
    promptTail: 'com a cidade, suas coordenadas e o link do BitDevs.',
    github: 'GitHub ↗',
    // Rendered as: <lead> jaonoctus <with> <love>, with two inline accents, so
    // it is split rather than kept as one string.
    creditLead: 'feito por',
    creditWith: 'com',
    creditLove: 'amor',
  },

  /** Country names as they appear in bitdevs.json, keyed by the raw value. */
  countries: {
    Brazil: 'Brasil',
  } as Record<string, string>,
}
