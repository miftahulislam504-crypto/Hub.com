'use client'
// components/providers/LanguageProvider.tsx
import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { translations, Lang, TranslationKey } from '@/lib/i18n'

interface LanguageContextType {
  lang: Lang
  toggleLang: () => void
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'bn',
  toggleLang: () => {},
  t: (key) => key,
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('bn')

  const toggleLang = useCallback(() => {
    setLang(prev => prev === 'bn' ? 'en' : 'bn')
  }, [])

  const t = useCallback((key: TranslationKey, vars?: Record<string, string | number>): string => {
    let str: string = translations[lang][key] as string
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        str = str.replace(`{${k}}`, String(v))
      })
    }
    return str
  }, [lang])

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLang = () => useContext(LanguageContext)
