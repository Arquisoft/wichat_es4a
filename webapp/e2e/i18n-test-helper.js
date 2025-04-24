// e2e/steps/i18n-test-helper.js
const i18n = require('i18next');
const translationEN = require('../public/locales/en/translation.json');
const translationES = require('../public/locales/es/translation.json');

i18n.init({
  lng: 'es',  // It is 'es' because the test takes the default language of the browser.
  fallbackLng: 'es',
  debug: false,
  interpolation: {
    escapeValue: false,
  },
  resources: {
    en: { translation: translationEN },
    es: { translation: translationES },
  },
});

module.exports = i18n;
