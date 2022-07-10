import onChange from 'on-change';
import renderForm from './render/form.js';
import renderPosts from './render/posts.js';
import renderFeeds from './render/feeds.js';

export default (state, path, value, elements) => {
  const [input, btnAdd, text] = elements;
  const watchedState = onChange(state, () => {
    const { urlValidation, feedFetching, modal } = state;

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
        renderPosts(state, text);
        renderFeeds(state, text);
        break;
      case 'failed':
        renderForm('rejected', input, btnAdd);
        break;
      case 'updated':
        renderPosts(state, text);
        renderFeeds(state, text);
        break;
      default:
        break;
    }
  });

  watchedState[path].status = value;
};
