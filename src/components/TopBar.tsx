import logo from '../assets/bitdevs-br-logo.svg'
import { useI18n } from '../i18n'

const navLink =
  'font-mono text-xs tracking-[0.04em] no-underline transition-colors duration-200'

interface Props {
  route: 'home' | 'topics' | 'about'
}

export default function TopBar({ route }: Props) {
  const { t } = useI18n()

  // Topics and What is BitDevs? are standalone routes with no other entry
  // point, so they stay visible on mobile; Map/Cities are anchors on the
  // (already-visible) home page.
  const linkClass = (active: boolean, alwaysShow = false) =>
    `${navLink} ${alwaysShow ? '' : 'max-[680px]:hidden'} ${active ? 'text-strong' : 'text-muted hover:text-strong'}`

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-[rgba(4,18,10,0.82)] backdrop-blur-[8px]">
      <div className="wrap flex h-16 items-center justify-between">
        <a className="flex items-center gap-[11px] no-underline" href="#/">
          <img
            src={logo}
            alt=""
            aria-hidden
            className="h-6 w-6 shrink-0 drop-shadow-[0_1px_6px_rgba(0,0,0,0.4)]"
          />
          <span className="text-sm font-bold tracking-[-0.01em] text-strong">
            BitDevs <b className="font-bold text-br-blue-400">Brasil</b>
          </span>
        </a>

        <nav className="flex items-center gap-[26px]">
          <a className={linkClass(route === 'home')} href="#map">
            {t.nav.map}
          </a>
          <a className={linkClass(route === 'topics', true)} href="#/topics">
            {t.nav.topics}
          </a>
          <a
            className={`${navLink} text-muted hover:text-strong max-[680px]:hidden`}
            href="#cities"
          >
            {t.nav.cities}
          </a>
          <a
            className={`${navLink} ${
              route === 'about' ? 'text-br-yellow-300' : 'text-br-yellow hover:text-br-yellow-300'
            }`}
            href="#/about"
          >
            {t.nav.whatIs}
          </a>
        </nav>
      </div>
    </header>
  )
}
