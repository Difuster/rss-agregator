import * as yup from 'yup';
import i18n from 'i18next';
import onChange from 'on-change';
import ru from './locales/ru';
import render from './render';
import { getRSS, updateRSS } from './rss';

export default () => {
  const input = document.querySelector('#url-input');
  const btn = document.querySelector('.btn');

  const i18nInstance = i18n.createInstance();
  i18nInstance.init({
    lng: 'ru',
    debug: false,
    resources: {
      ru,
    },
  });

  const state = {
    url: '',
    status: '',
    feeds: [],
    error: '',
    feedInfo: [],
  };

  const watchedState = onChange(state, () => {
    switch (state.status) {
      case 'begin':
        input.focus();
        btn.disabled = true;
        break;
      case 'filling':
        btn.disabled = false;
        input.classList.remove('is-invalid');
        break;
      case 'resolved':
        btn.disabled = true;
        input.value = '';
        input.focus();
        input.classList.remove('is-invalid');
        render(state, i18nInstance);
        break;
      case 'rejected':
        btn.disabled = true;
        input.classList.add('is-invalid');
        break;
      case 'updated':
        render(state, i18nInstance);
        break;
      default:
        break;
    }
  });

  const validateLink = (link, feeds) => {
    yup.setLocale({
      mixed: {
        notOneOf: 'notOneOf',
      },
      string: {
        url: 'validationError',
      },
    });
    const schema = yup.string().url().notOneOf(feeds);
    return schema.validate(link);
  };

  input.addEventListener('input', () => {
    watchedState.status = 'filling';
  });

  btn.addEventListener('click', (event) => {
    event.preventDefault();
    state.url = input.value;
    validateLink(state.url, state.feeds)
      .then((url) => {
        state.feeds.push(url);
        getRSS(url, watchedState);
      })
      .catch((e) => {
        watchedState.status = 'rejected';
        state.error = e.errors.map((err) => i18nInstance.t([`errMessages.${err}`]));
      });
  });

  const updateFeed = () => {
    setTimeout(() => {
      updateRSS(state.feedInfo, watchedState);
      updateFeed();
    }, 5000);
  };

  watchedState.status = 'begin';
  updateFeed();
};
