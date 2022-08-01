import i18n from 'i18next';

const input = document.querySelector('#url-input');
const btnAdd = document.querySelector('[aria-label="add"]');
const text = i18n.t;

const elements = [input, btnAdd];

const renderInput = (status, inputForm, btn) => {
  switch (status) {
    case 'filling':
      btn.disabled = false;
      inputForm.classList.remove('is-invalid');
      break;
    case 'loading':
      btn.disabled = true;
      inputForm.setAttribute('readonly', 'true');
      break;
    case 'resolved':
      btn.disabled = false;
      inputForm.removeAttribute('readonly');
      inputForm.value = '';
      inputForm.focus();
      inputForm.classList.remove('is-invalid');
      break;
    case 'rejected':
      btn.disabled = false;
      inputForm.removeAttribute('readonly');
      inputForm.classList.add('is-invalid');
      break;
    default:
      break;
  }
};

const renderMessage = (messages) => {
  const index = messages.length - 1;
  const message = {
    value: messages[index],
    isError: false,
  };
  const p = document.querySelector('.feedback');
  if (message.value !== 'successMessage') {
    p.classList.add('text-danger');
    p.classList.remove('text-success');
    message.isError = true;
  } else {
    p.classList.add('text-success');
    p.classList.remove('text-danger');
  }
  p.textContent = message.isError ? text(`errMessages.${message.value}`) : text(message.value);
};

const renderModal = (modal, postTitle, postURL, postDescr) => {
  const title = modal.querySelector('.modal-title');
  title.textContent = postTitle;
  const description = modal.querySelector('.modal-body');
  description.textContent = postDescr;
  modal.querySelector('.full-article').setAttribute('href', postURL);
};

const renderPosts = (state, t) => {
  const postsDiv = document.querySelector('.posts');
  postsDiv.innerHTML = '';
  const cardDiv = document.createElement('div');
  cardDiv.classList.add('card', 'border-0');
  const cardBodyDiv = document.createElement('div');
  cardBodyDiv.classList.add('card-body');
  const postHeader = document.createElement('h2');
  postHeader.classList.add('card-title', 'h4');
  postHeader.textContent = t(['outputHeaders.posts']);
  const listItem = document.createElement('ul');
  listItem.classList.add('list-group', 'border-0', 'rounded-0');
  const modal = document.querySelector('#modal');

  const createPosts = (posts) => {
    const viewedPosts = state.uiState.posts.filter((i) => i.viewed === true).map((i) => i.postId);
    const links = posts.map((post) => {
      const item = document.createElement('li');
      item.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
      const link = document.createElement('a');
      if (viewedPosts.includes(post.id)) {
        link.classList.add('fw-normal', 'text-secondary');
      } else {
        link.classList.add('fw-bold');
      }
      link.setAttribute('target', '_blank');
      const previewBtn = document.createElement('button');
      previewBtn.classList.add('btn', 'btn-outline-primary', 'btn-sm');
      previewBtn.setAttribute('type', 'button');
      previewBtn.setAttribute('role', 'button');
      previewBtn.setAttribute('data-bs-toggle', 'modal');
      previewBtn.setAttribute('data-bs-target', '#modal');
      previewBtn.textContent = t(['postText.preview']);
      link.textContent = post.title;
      link.href = post.link;
      item.append(link, previewBtn);

      const handlePostStatus = () => {
        state.uiState.posts.forEach((uiStatePost) => {
          if (uiStatePost.postId === post.id) {
            uiStatePost.viewed = true;
          }
        });
        link.classList.remove('fw-bold');
        link.classList.add('fw-normal', 'text-secondary');
      };

      previewBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (e.target === previewBtn) {
          renderModal(modal, post.title, post.link, post.description);
          handlePostStatus();
        }
      });

      link.addEventListener('click', (e) => {
        e.preventDefault();
        handlePostStatus();
        window.open(e.target.getAttribute('href'));
      });

      return item;
    });

    listItem.append(...links);

    cardBodyDiv.append(postHeader);
    cardDiv.append(cardBodyDiv, listItem);
    postsDiv.append(cardDiv);
  };

  let posts = [];
  const checkedFeeds = state.uiState.feeds.filter((feed) => feed.checked === true);
  const checkedFeedId = checkedFeeds.length > 0 ? checkedFeeds[0].feedId : null;
  const postsIfFeedChecked = [...state.posts.filter((post) => post.feedId === checkedFeedId)];
  posts = postsIfFeedChecked.length > 0 ? postsIfFeedChecked : [...state.posts];

  createPosts(posts);
};

const renderFeeds = (state, t) => {
  const feedDiv = document.querySelector('.feeds');
  feedDiv.innerHTML = '';
  const cardDiv = document.createElement('div');
  cardDiv.classList.add('card', 'border-0');
  const cardBodyDiv = document.createElement('div');
  cardBodyDiv.classList.add('card-body');
  const cardHeader = document.createElement('h2');
  cardHeader.classList.add('card-title', 'h4');
  cardHeader.textContent = t(['outputHeaders.feeds']);
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

    const handleFeedStatus = () => {
      state.uiState.feeds.map((uiStatefeed) => {
        if (uiStatefeed.feedId === feed.id) {
          uiStatefeed.checked = true;
        } else {
          uiStatefeed.checked = false;
        }
        return uiStatefeed;
      });
    };

    h3.addEventListener('mouseover', (e) => {
      e.preventDefault();
      e.target.style.cursor = 'pointer';
    });

    h3.addEventListener('click', (e) => {
      e.preventDefault();
      handleFeedStatus();
      renderPosts(state, text);
    });

    cardBodyDiv.append(cardHeader);
    cardDiv.append(cardBodyDiv, ul);
    feedDiv.append(cardDiv);
  });
};

const setStateStatus = (state) => {
  switch (state.urlValidation.status) {
    case 'filling':
      renderInput('filling', input, btnAdd);
      break;
    case 'valid':
      text(state.errors.length - 1);
      break;
    case 'invalid':
      renderInput('rejected', input, btnAdd);
      renderMessage(state.errors);
      break;
    default:
      break;
  }

  switch (state.feedFetching.status) {
    case 'idle':
      input.focus();
      btnAdd.disabled = false;
      break;
    case 'fetching':
      renderInput('loading', input, btnAdd);
      break;
    case 'finished':
      renderInput('resolved', input, btnAdd);
      renderPosts(state, text);
      renderFeeds(state, text);
      renderMessage(state.errors);
      break;
    case 'failed':
      renderInput('rejected', input, btnAdd);
      renderMessage(state.errors);
      break;
    case 'updated':
      renderPosts(state, text);
      renderFeeds(state, text);
      break;
    default:
      break;
  }
};

export { elements, setStateStatus };
