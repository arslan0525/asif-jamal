"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { Language, useTranslation, translations } from "@/lib/translations"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  isUrdu: boolean
  t: (key: keyof typeof translations["en"], replacements?: Record<string, string | number>) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en")

  useEffect(() => {
    // When language changes, update dir attribute for RTL support
    const dir = language === "ur" ? "rtl" : "ltr"
    document.documentElement.dir = dir
    
    if (language === "ur") {
      document.documentElement.classList.add("font-urdu")
      document.documentElement.classList.remove("font-sans")
    } else {
      document.documentElement.classList.add("font-sans")
      document.documentElement.classList.remove("font-urdu")
    }
  }, [language])

  const { t } = useTranslation(language)

  return (
    <LanguageContext.Provider value={{ language, setLanguage, isUrdu: language === "ur", t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
