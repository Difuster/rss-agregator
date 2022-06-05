const renderModal = (modal, postTitle, postURL, postDescr) => {
  const title = modal.querySelector('.modal-title');
  title.textContent = postTitle;
  const description = modal.querySelector('.modal-body');
  description.textContent = postDescr;
  modal.querySelector('.full-article').setAttribute('href', postURL);
};

export default renderModal;
