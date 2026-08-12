import { LANGS, useI18n } from '../i18n'

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-[15px] w-[15px]">
      <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58 0-.29-.01-1.04-.02-2.05-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.74.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6.01 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.25 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.8 5.62-5.48 5.92.43.37.81 1.1.81 2.22 0 1.6-.02 2.89-.02 3.28 0 .32.22.7.83.58A12 12 0 0 0 24 12.5C24 5.87 18.63.5 12 .5Z" />
    </svg>
  )
}

function LanguagePicker() {
  const { lang, setLang, t } = useI18n()

  return (
    <div
      role="group"
      aria-label={t.nav.language}
      className="flex items-center gap-[9px] font-mono text-[11.5px] tracking-[0.04em]"
    >
      <span className="text-faint">{t.nav.language}</span>
      {LANGS.map((code, i) => (
        <span key={code} className="flex items-center gap-[9px]">
          {i > 0 && (
            <span className="text-line-strong" aria-hidden>
              /
            </span>
          )}
          <button
            type="button"
            // Each option is written in its own language, so the tag has to
            // match or a screen reader reads "EN" with Portuguese phonetics.
            lang={code}
            onClick={() => setLang(code)}
            aria-current={lang === code || undefined}
            className={`transition-colors duration-200 ${
              lang === code ? 'text-br-yellow' : 'text-muted hover:text-strong'
            }`}
          >
            {code.toUpperCase()}
          </button>
        </span>
      ))}
    </div>
  )
}

export default function Footer() {
  const { t } = useI18n()

  return (
    <footer className="border-t border-line bg-[#061609]">
      <div className="wrap flex flex-wrap items-center justify-between gap-7 pt-[30px] pb-8 max-[680px]:flex-col max-[680px]:items-start max-[680px]:gap-[22px]">
        <p className="m-0 font-mono text-[12.5px] tracking-[0.04em] text-muted">
          {t.footer.creditLead}{' '}
          <a
            href="https://jaonoctus.dev"
            target="_blank"
            rel="noopener"
            className="text-br-yellow no-underline transition-colors duration-200 hover:text-br-yellow-300"
          >
            jaonoctus
          </a>{' '}
          {t.footer.creditWith} <span className="text-br-blue-400">{t.footer.creditLove}</span>
        </p>

        <div className="flex max-w-[360px] flex-col items-start gap-4">
          <p className="text-[13.5px] leading-[1.6] text-pretty text-body">
            {t.footer.promptLead}{' '}
            <a
              href="https://github.com/jaonoctus/bitdevs.com.br"
              target="_blank"
              rel="noopener"
              className="border-b border-b-[rgba(255,223,0,0.4)] text-br-yellow no-underline hover:border-b-br-yellow"
            >
              {t.footer.repository}
            </a>{' '}
            {t.footer.promptTail}
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <a
              href="https://github.com/jaonoctus/bitdevs.com.br"
              target="_blank"
              rel="noopener"
              className="flex items-center gap-[7px] font-mono text-xs tracking-[0.04em] text-muted no-underline transition-colors duration-200 hover:text-strong"
            >
              <GitHubIcon />
              {t.footer.github}
            </a>
            <LanguagePicker />
          </div>
        </div>
      </div>
    </footer>
  )
}
