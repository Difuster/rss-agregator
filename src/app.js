import * as yup from 'yup';
import i18n from 'i18next';
import onChange from 'on-change';
import ru from './locales/ru';
import { getRSS, updateRSS } from './rss';
import {
  hideModal, renderPosts, renderFeeds, renderMessage,
} from './render';

export default () => {
  const input = document.querySelector('#url-input');
  const btn = document.querySelector('[aria-label="add"]');
  const modal = document.querySelector('#modal');
  const modalCloseBtns = modal.querySelectorAll('button');

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
        renderPosts(state, i18nInstance);
        renderFeeds(state, i18nInstance);
        break;
      case 'rejected':
        btn.disabled = true;
        input.classList.add('is-invalid');
        break;
      case 'updated':
        renderPosts(state, i18nInstance);
        renderFeeds(state, i18nInstance);
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
        renderMessage(i18nInstance.t(['successMessage']));
      })
      .catch((e) => {
        watchedState.status = 'rejected';
        state.error = e.errors.map((err) => i18nInstance.t([`errMessages.${err}`]));
        renderMessage(state.error, true);
      });
  });

  modal.addEventListener('click', (event) => {
    event.preventDefault();
    if (event.target === modalCloseBtns || event.target !== this) {
      hideModal(modal);
    }
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
