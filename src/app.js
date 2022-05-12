import 'bootstrap';
import * as yup from 'yup';
import _ from 'lodash';
import i18n from 'i18next';
import onChange from 'on-change';

import resources from './locales/index.js';
import downloadRSS from './rss.js';
import { hideModal } from './render/modal.js';
import renderForm from './render/form.js';
import renderPosts from './render/posts.js';
import renderFeeds from './render/feeds.js';
import renderMessage from './render/message.js';
import parseRSS from './parser.js';
import updateRss from './updateRss.js';

export default async () => {
  const input = document.querySelector('#url-input');
  const btnAdd = document.querySelector('[aria-label="add"]');
  const modal = document.querySelector('#modal');
  const modalCloseBtns = modal.querySelectorAll('button');
  const readArticleBtn = modal.querySelector('.full-article');

  const i18nInstance = i18n.createInstance();
  await i18nInstance.init({
    lng: 'ru',
    debug: false,
    resources,
  }).then((t) => t);

  const state = {
    status: 'ready',
    validationStatus: 'ready',
    errors: [],
    feeds: [],
    posts: [],
    updatingPeriod: 5000,
    checkedFeedId: 0,
  };

  const watchedStatus = onChange(state, () => {
    switch (state.status) {
      case 'start':
        input.focus();
        btnAdd.disabled = false;
        break;
      case 'filling':
        renderForm('filling', input, btnAdd);
        break;
      case 'loading':
        renderForm('loading', input, btnAdd);
        break;
      case 'resolved':
        renderForm('resolved', input, btnAdd);
        renderPosts(state, i18nInstance);
        renderFeeds(state, i18nInstance);
        break;
      case 'rejected':
        renderForm('rejected', input, btnAdd);
        break;
      case 'updated':
        renderPosts(state, i18nInstance);
        renderFeeds(state, i18nInstance);
        break;
      default:
        break;
    }
  });

  const watchedValidation = onChange(state, () => {
    switch (state.validationStatus) {
      case 'ready':
        break;
      case 'valid':
        state.errors.push(i18nInstance.t(['isValid']));
        break;
      case 'invalid':
        renderForm('rejected', input, btnAdd);
        break;
      default:
        break;
    }
  });

  const validateLink = (link, feeds) => {
    const links = feeds.map((feed) => feed.link);
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
      .notOneOf(links);
    return schema.validate(link);
  };

  const updateFeed = () => {
    const period = state.updatingPeriod;
    updateRss(state, i18nInstance);
    watchedStatus.status = 'updated';
    watchedStatus.status = 'ready';
    setTimeout(() => {
      updateFeed();
    }, period);
  };

  input.addEventListener('input', () => {
    watchedStatus.status = 'filling';
  });

  btnAdd.addEventListener('click', (e) => {
    e.preventDefault();
    const currUrl = input.value;
    validateLink(currUrl, state.feeds)
      .then((url) => {
        watchedValidation.validationStatus = 'valid';
        watchedStatus.status = 'loading';
        const rss = downloadRSS(url);
        rss
          .then((response) => {
            const { feed, posts } = parseRSS(response, url);
            state.feeds = [feed, ...state.feeds];
            state.posts = _.flatten([posts, ...state.posts]);
            state.errors.push(i18nInstance.t(['successMessage']));
            watchedStatus.status = 'resolved';
            watchedValidation.validationStatus = 'ready';
            renderMessage(state.errors);
            updateFeed();
          })
          .catch((error) => {
            state.errors.push(i18nInstance.t([`errMessages.${error.message}`]));
            watchedStatus.status = 'rejected';
            renderMessage(state.errors);
          });
      })
      .catch((error) => {
        watchedValidation.validationStatus = 'invalid';
        const curErr = error.errors.map((err) => i18nInstance.t([`errMessages.${err}`]));
        state.errors = _.flatten([...state.errors, curErr]);
        renderMessage(state.errors);
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

  watchedStatus.status = 'start';
};
