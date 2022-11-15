import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
const Store = require('electron-store');
const store = new Store();

i18n.use(initReactI18next).init({
  resources:store.get('locales'),
  supportedLngs: ['ru', 'en','es','tr'],
  fallbackLng: ['en'],
  lng: store.get('lng'),
  preload: ['ru', 'en','es','tr'],
  ns: 'translation',
  defaultNS: 'translation',
  interpolation: {
    escapeValue: false, // not needed for react as it escapes by default
  },
  react: {
    // Turn off the use of React Suspense
    useSuspense: false
  }
});

