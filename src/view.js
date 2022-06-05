import onChange from 'on-change';
import renderForm from './render/form.js';
import renderPosts from './render/posts.js';
import renderFeeds from './render/feeds.js';
import { hideModal } from './render/modal.js';

export default (state, path, value, elements) => {
  console.log(elements);
  const [input, btnAdd, text, modalWindow, readArticleBtn] = elements;
  console.log(modalWindow);
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

    // switch (modal.status) {
    //   case 'hidden':
    //     hideModal(modalWindow);
    //     break;
    //   case 'opened':
    //     window.open(readArticleBtn.getAttribute('href'));
    //     break;
    //   default:
    //     break;
    // }
  });

  watchedState[path].status = value;
};
