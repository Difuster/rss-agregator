export default (status, input, btn) => {
  switch (status) {
    case 'filling':
      btn.disabled = false;
      input.classList.remove('is-invalid');
      break;
    case 'loading':
      btn.disabled = true;
      input.setAttribute('readonly', 'true');
      break;
    case 'resolved':
      btn.disabled = false;
      input.removeAttribute('readonly');
      input.value = '';
      input.focus();
      input.classList.remove('is-invalid');
      break;
    case 'rejected':
      btn.disabled = false;
      input.removeAttribute('readonly');
      input.classList.add('is-invalid');
      break;
    default:
      break;
  }
};
