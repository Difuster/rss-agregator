import 'bootstrap';
import * as yup from 'yup';
import _ from 'lodash';

import initState from './initState.js';
import updateRss from './updateRss.js';
import downloadRSS from './rss.js';
import parseRSS from './parser.js';
import { elements, watcher } from './view.js';
import init from './init.js';

const [input, btnAdd, text] = elements;

const app = () => {
  const state = initState;

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
    updateRss(state)
      .then(() => {
        watcher('feedFetching', 'updated');
        setTimeout(() => {
          watcher('feedFetching', 'idle');
          updateFeed();
        }, period);
      });
  };

  input.addEventListener('input', () => {
    watcher('urlValidation', 'filling');
  });

  btnAdd.addEventListener('click', (e) => {
    e.preventDefault();
    const currUrl = input.value;
    validateLink(currUrl, state.feeds)
      .then((url) => {
        state.errors.push(text(['isValid']));
        watcher('urlValidation', 'valid');
        watcher('feedFetching', 'fetching');
        const rss = downloadRSS(url);
        rss
          .then((response) => {
            const { feed, posts } = parseRSS(response, url);
            state.feeds = [feed, ...state.feeds];
            state.posts = _.flatten([posts, ...state.posts]);
            state.errors.push(text(['successMessage']));
            watcher('feedFetching', 'finished');
            watcher('urlValidation', 'idle');
            updateFeed();
          })
          .catch((error) => {
            state.errors.push(text([`errMessages.${error.message}`]));
            watcher('feedFetching', 'failed');
          });
      })
      .catch((error) => {
        const curErr = error.errors.map((err) => text([`errMessages.${err}`]));
        state.errors = _.flatten([...state.errors, curErr]);
        watcher('urlValidation', 'invalid');
      });
  });

  watcher('feedFetching', 'idle');
};

export default () => init().then(app);
