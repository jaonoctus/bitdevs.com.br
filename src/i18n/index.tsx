import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { ptBR } from './pt-br'
import { en } from './en'

/** Locale codes are BCP 47 tags, so they double as the <html lang> value. */
export type Lang = 'pt-BR' | 'en'
/** The shape every locale must satisfy — see ./pt-br, which defines it. */
export type Dict = typeof ptBR

export const LANGS: Lang[] = ['pt-BR', 'en']

/**
 * Brazilian Portuguese is the default, deliberately without sniffing
 * navigator.language: this is a Brazilian site, and plenty of its audience runs
 * an English-configured browser. Only an explicit choice, remembered below,
 * moves the site off pt-BR.
 */
const DEFAULT_LANG: Lang = 'pt-BR'
const STORAGE_KEY = 'bitdevs-lang'

const DICTS: Record<Lang, Dict> = { 'pt-BR': ptBR, en }

interface I18n {
  lang: Lang
  setLang: (lang: Lang) => void
  t: Dict
}

const I18nContext = createContext<I18n>({
  lang: DEFAULT_LANG,
  setLang: () => {},
  t: ptBR,
})

const isLang = (value: unknown): value is Lang => LANGS.includes(value as Lang)

function storedLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return isLang(saved) ? saved : DEFAULT_LANG
  } catch {
    // Storage can throw outright in private mode / with cookies blocked.
    return DEFAULT_LANG
  }
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(storedLang)

  // index.html ships lang="pt-BR"; keep it truthful when the choice changes.
  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Non-fatal: the choice just won't survive a reload.
    }
  }, [])

  const value = useMemo<I18n>(() => ({ lang, setLang, t: DICTS[lang] }), [lang, setLang])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18n {
  return useContext(I18nContext)
}

/** Country as stored in bitdevs.json, rendered in the active language. */
export function countryName(t: Dict, raw: string): string {
  return t.countries[raw] ?? raw
}
