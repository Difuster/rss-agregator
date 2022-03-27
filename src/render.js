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
  const divModalBackdrop = document.createElement('div');
  divModalBackdrop.classList.add('modal-backdrop', 'fade', 'show');
  body.append(divModalBackdrop);
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

const renderForm = (status, input, btn) => {
  switch (status) {
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
      btn.disabled = false;
      input.classList.add('is-invalid');
      break;
    default:
      break;
  }
};

const renderPosts = (state, i18nInstance) => {
  let feeds;
  if (state.selectedFeed.length === 0) {
    feeds = state.feeds;
  } else {
    feeds = state.selectedFeed;
  }
  const postsDiv = document.querySelector('.posts');
  postsDiv.innerHTML = '';
  const cardDiv = document.createElement('div');
  cardDiv.classList.add('card', 'border-0');
  const cardBodyDiv = document.createElement('div');
  cardBodyDiv.classList.add('card-body');
  const postHeader = document.createElement('h2');
  postHeader.classList.add('card-title', 'h4');
  postHeader.textContent = i18nInstance.t(['outputHeaders.posts']);
  const listItem = document.createElement('ul');
  listItem.classList.add('list-group', 'border-0', 'rounded-0');
  const modal = document.querySelector('#modal');

  feeds.forEach((feed) => {
    const links = feed.posts.map((post) => {
      const item = document.createElement('li');
      item.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
      const link = document.createElement('a');
      post.viewed === false ? link.classList.add('fw-bold') : link.classList.add('fw-normal', 'text-secondary');
      link.setAttribute('target', '_blank');
      const previewBtn = document.createElement('button');
      previewBtn.classList.add('btn', 'btn-outline-primary', 'btn-sm');
      previewBtn.setAttribute('data-bs-toggle', 'modal');
      previewBtn.setAttribute('data-bs-target', 'modal');
      previewBtn.setAttribute('aria-label', 'preview');
      previewBtn.textContent = i18nInstance.t(['postText.preview']);
      link.textContent = post.title;
      link.href = post.link;
      item.append(link, previewBtn);

      previewBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (e.target === previewBtn) {
          renderModal(modal, post.title, post.link, post.description);
          post.viewed = true;
          link.classList.remove('fw-bold');
          link.classList.add('fw-normal', 'text-secondary');
        }
      });

      link.addEventListener('click', (e) => {
        e.preventDefault();
        post.viewed = true;
        link.classList.remove('fw-bold');
        link.classList.add('fw-normal', 'text-secondary');
        window.open(e.target.getAttribute('href'));
      });

      return item;
    });

    listItem.append(...links);
  });

  cardBodyDiv.append(postHeader);
  cardDiv.append(cardBodyDiv, listItem);
  postsDiv.append(cardDiv);
};

const renderFeeds = (state, i18nInstance) => {
  const feedDiv = document.querySelector('.feeds');
  feedDiv.innerHTML = '';
  const cardDiv = document.createElement('div');
  cardDiv.classList.add('card', 'border-0');
  const cardBodyDiv = document.createElement('div');
  cardBodyDiv.classList.add('card-body');
  const cardHeader = document.createElement('h2');
  cardHeader.classList.add('card-title', 'h4');
  cardHeader.textContent = i18nInstance.t(['outputHeaders.feeds']);
  const ul = document.createElement('ul');
  ul.classList.add('list-group', 'border-0', 'rounded-0');
  state.feeds.forEach((feed) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'border-0', 'border-end-0');
    li.setAttribute('style', 'margin-bottom: 20px');
    const h3 = document.createElement('h3');
    h3.classList.add('h6', 'm-0');
    h3.textContent = `${feed.title}`;
    const p = document.createElement('p');
    p.classList.add('small', 'm-0', 'text-black-50');
    p.textContent = `${feed.description}`;
    li.append(h3, p);
    ul.append(li);
    h3.addEventListener('mouseover', (e) => {
      e.preventDefault();
      e.target.style.cursor = 'pointer';
    });
    h3.addEventListener('click', (e) => {
      e.preventDefault();
      state.selectedFeed = [];
      state.selectedFeed.push(feed);
      renderPosts(state, i18nInstance);
    });
  });

  cardBodyDiv.append(cardHeader);
  cardDiv.append(cardBodyDiv, ul);
  feedDiv.append(cardDiv);
};

const renderMessage = (message, err = false) => {
  const p = document.querySelector('.feedback');
  if (err === true) {
    p.classList.add('text-danger');
    p.classList.remove('text-success');
  } else {
    p.classList.add('text-success');
    p.classList.remove('text-danger');
  }
  p.textContent = message;
};

export {
  hideModal, renderForm, renderPosts, renderFeeds, renderMessage,
};
