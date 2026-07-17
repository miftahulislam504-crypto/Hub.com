'use client'
import { createContext, useContext, ReactNode } from 'react'
import { translations, TranslationKey } from '@/lib/i18n'

type TFn = (key: TranslationKey, vars?: Record<string, string | number>) => string

interface LangContextValue {
  lang: 'en'
  t: TFn
  toggleLang: () => void  // kept for compatibility but does nothing
}

const LangContext = createContext<LangContextValue | null>(null)

function translate(key: TranslationKey, vars?: Record<string, string | number>): string {
  let str: string = translations.en[key] ?? key
  if (vars) {
    Object.entries(vars).forEach(([k, v]) => {
      str = str.replace(`{${k}}`, String(v))
    })
  }
  return str
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  return (
    <LangContext.Provider value={{ lang: 'en', t: translate, toggleLang: () => {} }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang must be used within LanguageProvider')
  return ctx
}
