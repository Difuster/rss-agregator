import * as yup from 'yup';
import i18n from 'i18next';
import onChange from 'on-change';
import ru from './locales/ru.js';
import { downloadRSS, updateRSS } from './rss.js';
import {
  hideModal, renderForm, renderPosts, renderFeeds, renderMessage,
} from './render.js';
import parseUrl from './parser.js';

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
      case 'loading':
        renderForm('loading', input, btn);
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
        min: 'isEmpty',
      },
    });
    const schema = yup.string().url().min(1)
      .notOneOf(uploadedFeeds);
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
        watchedState.status = 'loading';
        const rss = downloadRSS(url);
        rss
          .then((response) => {
            const feed = parseUrl(response, url);
            state.feeds.unshift(feed);
            state.uploadedFeeds.push(url);
            state.error = i18nInstance.t(['successMessage']);
            watchedState.status = 'resolved';
            renderMessage(state.error);
            updateFeed();
          })
          .catch((error) => {
            state.error = i18nInstance.t([`errMessages.${error.message}`]);
            watchedState.status = 'rejected';
            renderMessage(state.error);
          });
      })
      .catch((error) => {
        state.error = error.errors.map((err) => i18nInstance.t([`errMessages.${err}`]));
        renderMessage(state.error);
        watchedState.status = 'rejected';
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
