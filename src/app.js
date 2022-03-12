import * as yup from 'yup';
import i18n from 'i18next';
import onChange from 'on-change';
import ru from './locales/ru';
import parseUrl from './parser';
import render from './render';

const axios = require('axios');

export default () => {
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
    status: '', // filling, resolved, rejected
    feeds: [],
    error: '',
    feedInfo: {
      feedTitles: [],
      feedDescriptions: [],
      postTitles: [],
      postLinks: [],
    },
  };

  const input = document.querySelector('#url-input');
  const btn = document.querySelector('.btn');

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
        break;
      case 'rejected':
        btn.disabled = true;
        input.classList.add('is-invalid');
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
      .then((data) => {
        watchedState.status = 'resolved';
        state.feeds.push(data);
        axios.get(`https://hexlet-allorigins.herokuapp.com/get?url=${encodeURIComponent(data)}`)
          .then((response) => {
            state.feedInfo.feedTitles.push(parseUrl(response).feedTitle);
            state.feedInfo.feedDescriptions.push(parseUrl(response).feedDescription);
            state.feedInfo.postTitles = [...state.feedInfo.postTitles, ...parseUrl(response).postTitles];
            state.feedInfo.postLinks = [...state.feedInfo.postLinks, ...parseUrl(response).postLinks];
            console.log(state);
            render(state, i18nInstance);
          })
          .catch((error) => console.log(error));
      })
      .catch((e) => {
        watchedState.status = 'rejected';
        state.error = e.errors.map((err) => i18nInstance.t([`errMessages.${err}`]));
      });
  });

  watchedState.status = 'begin';
};
