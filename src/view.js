import onChange from 'on-change';
import i18n from 'i18next';

import initState from './initState.js';
import renderForm from './render/form.js';
import renderPosts from './render/posts.js';
import renderFeeds from './render/feeds.js';
import renderMessage from './render/message.js';

const input = document.querySelector('#url-input');
const btnAdd = document.querySelector('[aria-label="add"]');
const modalWindow = document.querySelector('#modal');
const readArticleBtn = modalWindow.querySelector('.full-article');
const text = i18n.t;

const elements = [input, btnAdd, text, modalWindow, readArticleBtn];

const watchedState = onChange(initState, () => {
  const { urlValidation, feedFetching } = initState;

  switch (urlValidation.status) {
    case 'idle':
      break;
    case 'filling':
      renderForm('filling', input, btnAdd);
      break;
    case 'valid':
      break;
    case 'invalid':
      renderForm('rejected', input, btnAdd);
      renderMessage(initState.errors);
      break;
    default:
      break;
  }

  switch (feedFetching.status) {
    case 'idle':
      input.focus();
      btnAdd.disabled = false;
      break;
    case 'fetching':
      renderForm('loading', input, btnAdd);
      break;
    case 'finished':
      renderForm('resolved', input, btnAdd);
      renderPosts(initState, text);
      renderFeeds(initState, text);
      renderMessage(initState.errors);
      break;
    case 'failed':
      renderForm('rejected', input, btnAdd);
      renderMessage(initState.errors);
      break;
    case 'updated':
      renderPosts(initState, text);
      renderFeeds(initState, text);
      break;
    default:
      break;
  }
});

const watcher = (path, value) => {
  watchedState[path].status = value;
};

export { elements, watcher };
