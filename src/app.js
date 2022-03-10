import * as yup from 'yup';
import i18n from 'i18next';
import onChange from 'on-change';
import ru from './locales/ru';

export default () => {
  const i18nInstance = i18n.createInstance();
  i18nInstance.init({
    lng: 'ru',
    debug: false,
    resources: {
      ru,
    },
  }).then((t) => t);

  const state = {
    url: {
      link: '',
      isValid: false,
      isDuplicated: false,
    },
    status: '', // filling, resolved, rejected
    feeds: [],
    errors: [],
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
  watchedState.status = 'begin';

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
    state.url.link = input.value;
    validateLink(state.url.link, state.feeds)
      .then((data) => {
        watchedState.status = 'resolved';
        state.feeds.push(data);
      })
      .catch((e) => {
        watchedState.status = 'rejected';
        const errMessage = e.errors.map((err) => i18nInstance.t(err));
        console.log(errMessage);
      });
  });
};
