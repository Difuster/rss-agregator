import onChange from 'on-change';

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

export {
  state, watchedState, btn, input,
};
