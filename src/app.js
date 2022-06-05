import 'bootstrap';
import * as yup from 'yup';
import _ from 'lodash';
import i18n from 'i18next';

import updateRss from './updateRss.js';
import downloadRSS from './rss.js';
import renderMessage from './render/message.js';
import parseRSS from './parser.js';
import watcher from './view.js';
import init from './init.js';

const app = () => {
  const input = document.querySelector('#url-input');
  const btnAdd = document.querySelector('[aria-label="add"]');
  const modalWindow = document.querySelector('#modal');
  const readArticleBtn = modalWindow.querySelector('.full-article');
  const text = i18n.t;

  const elements = [input, btnAdd, text, modalWindow, readArticleBtn];

  const state = {
    urlValidation: {
      status: 'idle', // filling, valid, invalid
    },
    feedFetching: {
      status: null, // idle, fetching, finished, failed, updated
    },
    feeds: [],
    posts: [],
    errors: [],
    modal: {
      status: 'hidden',
    },
  };

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
    const period = 5000;
    updateRss(state);
    watcher(state, 'feedFetching', 'updated', elements);
    watcher(state, 'feedFetching', 'idle', elements);
    setTimeout(() => {
      updateFeed();
    }, period);
  };

  input.addEventListener('input', () => {
    watcher(state, 'urlValidation', 'filling', elements);
  });

  btnAdd.addEventListener('click', (e) => {
    e.preventDefault();
    const currUrl = input.value;
    validateLink(currUrl, state.feeds)
      .then((url) => {
        watcher(state, 'urlValidation', 'valid', elements);
        state.errors.push(text(['isValid']));
        watcher(state, 'feedFetching', 'fetching', elements);
        const rss = downloadRSS(url);
        rss
          .then((response) => {
            const { feed, posts } = parseRSS(response, url);
            state.feeds = [feed, ...state.feeds];
            state.posts = _.flatten([posts, ...state.posts]);
            state.errors.push(text(['successMessage']));
            watcher(state, 'feedFetching', 'finished', elements);
            watcher(state, 'urlValidation', 'idle', elements);
            renderMessage(state.errors);
            updateFeed();
          })
          .catch((error) => {
            state.errors.push(text([`errMessages.${error.message}`]));
            watcher(state, 'feedFetching', 'failed', elements);
            renderMessage(state.errors);
          });
      })
      .catch((error) => {
        watcher(state, 'urlValidation', 'invalid', elements);
        const curErr = error.errors.map((err) => text([`errMessages.${err}`]));
        state.errors = _.flatten([...state.errors, curErr]);
        renderMessage(state.errors);
      });
  });

  watcher(state, 'feedFetching', 'idle', elements);
};

export default () => init().then(app);
