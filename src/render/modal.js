const body = document.querySelector('body');

const renderModal = (modal, postTitle, postURL, postDescr) => {
  body.classList.add('modal-open');
  body.style.overflow = 'hidden';
  body.style.paddingRight = '0px';
  modal.classList.add('show');
  modal.removeAttribute('aria-hidden');
  modal.setAttribute('aria-modal', 'true');
  modal.style.display = 'block';
  const title = modal.querySelector('.modal-title');
  title.textContent = postTitle;
  const description = modal.querySelector('.modal-body');
  description.textContent = postDescr;
  modal.querySelector('.full-article').setAttribute('href', postURL);
};

const hideModal = (modal) => {
  body.classList.remove('modal-open');
  body.removeAttribute('style');
  modal.classList.remove('show');
  modal.setAttribute('aria-hidden', 'true');
  modal.removeAttribute('aria-modal');
  modal.style.display = 'none';
  const divModalBackdrop = document.querySelector('.modal-backdrop');
  divModalBackdrop.remove();
};

export { renderModal, hideModal };
