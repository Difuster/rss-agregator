import 'bootstrap';
import * as yup from 'yup';
import _ from 'lodash';
import axios from 'axios';
import onChange from 'on-change';
import uniqueId from 'lodash/uniqueId.js';

import parseRSS from './parser.js';
import { elements, setStateStatus } from './view.js';
import init from './init.js';

const [input, btnAdd] = elements;

const app = () => {
  const state = {
    urlValidation: {
      status: 'idle', // filling, valid, invalid
    },
    feedFetching: {
      status: 'ready', // fetching, finished, failed, updated
    },
    feeds: [],
    posts: [],
    errors: [],
    uiState: {
      modal: {
        status: 'hidden',
      },
      feeds: [],
      posts: [],
    },
  };

  const watchedState = onChange(state, () => setStateStatus(state));

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

  const downloadRSS = (url) => axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`);

  const updateRss = (feeds, posts, uiState) => {
    const promises = feeds.map((feed) => {
      const rss = downloadRSS(feed.link);
      rss
        .then((response) => {
          const newFeed = parseRSS(response, feed.link);
          const oldFeedTitles = posts.map((item) => item.title);
          const newFeedTitles = newFeed.posts.map((item) => item.title);
          const newTitles = _.differenceWith(newFeedTitles, oldFeedTitles, _.isEqual);
          newTitles.reverse().forEach((title) => {
            const newPost = newFeed.posts.filter((post) => post.title === title);
            posts = [...newPost, ...posts];
          });

          const newUiStatePosts = newFeed.posts.filter((post) => newTitles.includes(post.title))
            .map((post) => {
              const newPost = {
                postId: post.id,
                viewed: false,
              };
              return newPost;
            });

          uiState.posts = [...newUiStatePosts, ...uiState.posts];
        });
      return rss;
    });

    return Promise.all(promises);
  };

  const updateFeed = () => {
    const period = 5000;
    if (state.feedFetching !== 'fetching') {
      updateRss(state.feeds, state.posts, state.uiState)
        .then(() => {
          watchedState.feedFetching.status = 'updated';
          setTimeout(() => {
            watchedState.feedFetching.status = 'idle';
            updateFeed();
          }, period);
        });
    } else {
      setTimeout(() => {
        updateFeed();
      }, period);
    }
  };

  input.addEventListener('input', () => {
    watchedState.urlValidation.status = 'filling';
  });

  btnAdd.addEventListener('click', (e) => {
    e.preventDefault();
    const currUrl = input.value;
    validateLink(currUrl, state.feeds)
      .then((url) => {
        state.errors.push('isValid');
        watchedState.urlValidation.status = 'valid';
        watchedState.feedFetching.status = 'fetching';
        const rss = downloadRSS(url);
        rss
          .then((response) => {
            const {
              feed, posts,
            } = parseRSS(response, url);

            const feedId = uniqueId();
            feed.id = feedId;

            posts.forEach((post) => {
              const postId = uniqueId();
              post.id = postId;
              post.feedId = feed.id;
            });

            const uiStateFeed = {
              feedId: feed.id,
              checked: false,
            };

            const uiStatePosts = posts.map((post) => ({ postId: post.id, viewed: false }));

            state.errors.push('successMessage');
            state.feeds.push(feed);
            state.uiState.feeds.push(uiStateFeed);
            state.posts = _.flatten([posts, ...state.posts]);
            state.uiState.posts = [...uiStatePosts, ...state.uiState.posts];

            watchedState.urlValidation.status = 'idle';
            watchedState.feedFetching.status = 'finished';
            updateFeed();
          })
          .catch((error) => {
            state.errors.push(error.message);
            watchedState.feedFetching.status = 'failed';
          });
      })
      .catch((error) => {
        state.errors.push(error.message);
        watchedState.urlValidation.status = 'invalid';
      });
  });

  watchedState.feedFetching.status = 'idle';
};

export default () => init().then(app);
