import * as yup from 'yup';
import i18n from 'i18next';
import onChange from 'on-change';
import ru from './locales/ru.js';
import { getRSS, updateRSS } from './rss.js';
import {
  hideModal, renderForm, renderPosts, renderFeeds, renderMessage,
} from './render.js';

export default () => {
  const input = document.querySelector('#url-input');
  const btn = document.querySelector('[aria-label="add"]');
  const modal = document.querySelector('#modal');
  const modalCloseBtns = modal.querySelectorAll('button');
  const readArticleBtn = modal.querySelector('.full-article');

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
    uploadedFeeds: [],
    error: '',
    feeds: [],
    selectedFeed: [],
  };

  const watchedState = onChange(state, () => {
    switch (state.status) {
      case 'begin':
        renderForm('begin', input, btn);
        break;
      case 'filling':
        renderForm('filling', input, btn);
        break;
      case 'resolved':
        renderForm('resolved', input, btn);
        renderPosts(state, i18nInstance);
        renderFeeds(state, i18nInstance);
        break;
      case 'rejected':
        renderForm('rejected', input, btn);
        break;
      case 'updated':
        renderPosts(state, i18nInstance);
        renderFeeds(state, i18nInstance);
        break;
      default:
        break;
    }
  });

  const validateLink = (link, uploadedFeeds) => {
    yup.setLocale({
      mixed: {
        notOneOf: 'notOneOf',
      },
      string: {
        url: 'validationError',
      },
    });
    const schema = yup.string().url().notOneOf(uploadedFeeds);
    return schema.validate(link);
  };

  const updateFeed = () => {
    updateRSS(state.feeds);
    watchedState.status = 'updated';
    watchedState.status = '';
    setTimeout(() => {
      updateFeed();
    }, 5000);
  };

  input.addEventListener('input', () => {
    watchedState.status = 'filling';
  });

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    state.url = input.value;
    validateLink(state.url, state.uploadedFeeds)
      .then((url) => {
        watchedState.status = 'resolved';
        state.uploadedFeeds.push(url);
        getRSS(url, watchedState, i18nInstance, renderMessage);
        renderMessage(i18nInstance.t(['successMessage']));
        updateFeed();
      })
      .catch((error) => {
        watchedState.status = 'rejected';
        state.error = error.errors.map((err) => i18nInstance.t([`errMessages.${err}`]));
        renderMessage(state.error, true);
      });
  });

  modal.addEventListener('click', (event) => {
    event.preventDefault();
    if (event.target === modalCloseBtns[0] || event.target === modalCloseBtns[1]) {
      hideModal(modal);
    }
    if (event.target === readArticleBtn) {
      window.open(readArticleBtn.getAttribute('href'));
    }
  });

  watchedState.status = 'begin';
};
