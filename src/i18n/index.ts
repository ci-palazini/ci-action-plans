import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import en from './locales/en.json'
import enGB from './locales/en-GB.json'
import enUS from './locales/en-US.json'
import ptBR from './locales/pt-BR.json'
import es from './locales/es.json'
import zh from './locales/zh.json'
import fr from './locales/fr.json'
import de from './locales/de.json'
import it from './locales/it.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en:    { translation: en },
      'en-GB': { translation: { ...en, ...enGB } },
      'en-US': { translation: { ...en, ...enUS } },
      'pt-BR': { translation: ptBR },
      es:    { translation: es },
      zh:    { translation: zh },
      fr:    { translation: fr },
      de:    { translation: de },
      it:    { translation: it },
    },
    fallbackLng: 'en',
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
    interpolation: { escapeValue: false },
  })

export default i18n
