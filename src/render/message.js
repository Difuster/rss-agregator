export default (messages) => {
  const index = messages.length - 1;
  const message = messages[index];
  const p = document.querySelector('.feedback');
  if (message !== 'RSS успешно загружен') {
    p.classList.add('text-danger');
    p.classList.remove('text-success');
  } else {
    p.classList.add('text-success');
    p.classList.remove('text-danger');
  }
  p.textContent = message;
};
