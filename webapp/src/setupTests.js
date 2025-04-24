// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
//añadido ana
import { TextEncoder } from 'util';
global.TextEncoder = TextEncoder;

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import translationEN from '../public/locales/en/translation.json';
import translationES from '../public/locales/es/translation.json';

i18n.use(initReactI18next).init({
    lng: 'en', // o puedes leerlo de process.env para tests multiidioma
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: { translation: translationEN },
      es: { translation: translationES },
    },
  });

  import ResizeObserver from 'resize-observer-polyfill';

  global.ResizeObserver = ResizeObserver;