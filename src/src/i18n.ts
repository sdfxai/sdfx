import { createI18n } from 'vue-i18n'
import messages from '@/locales'

const locale = 'en'
const currency = 'USD'

const setDateTimeFormats = {
  short: {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  },
  long: {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
    hour: 'numeric',
    minute: 'numeric',
  },
}

const dateTimeFormats = {
  fr: setDateTimeFormats,
  en: setDateTimeFormats,
  es: setDateTimeFormats,
  de: setDateTimeFormats,
  'en-GB': setDateTimeFormats,
}

export default createI18n({
  legacy: false,
  locale: locale.slice(0, 2).toLowerCase(),
  fallbackLocale: 'en',
  globalInjection: true,
  messages: messages,
  dateTimeFormats: dateTimeFormats,
  numberFormats: {
    en: { currency: { style: 'currency', currency: currency } },
    fr: { currency: { style: 'currency', currency: currency } }
  }
})
