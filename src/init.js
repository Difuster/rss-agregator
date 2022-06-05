import i18n from 'i18next';
import resources from './locales/index.js';

const init = () => i18n
  .init({
    lng: 'ru',
    debug: false,
    resources,
  });

export default init;
