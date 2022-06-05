import renderModal from './modal.js';

const getLinksToRender = (state) => {
  let links = [];
  const checkedFeeds = state.feeds.filter((feed) => feed.checked === true);
  checkedFeeds.length > 0 ? links = [...state.posts.filter((post) => post.feedId === checkedFeeds[0].id)] : links = [...state.posts];
  return links;
};

export default (state, text) => {
  const postsDiv = document.querySelector('.posts');
  postsDiv.innerHTML = '';
  const cardDiv = document.createElement('div');
  cardDiv.classList.add('card', 'border-0');
  const cardBodyDiv = document.createElement('div');
  cardBodyDiv.classList.add('card-body');
  const postHeader = document.createElement('h2');
  postHeader.classList.add('card-title', 'h4');
  postHeader.textContent = text(['outputHeaders.posts']);
  const listItem = document.createElement('ul');
  listItem.classList.add('list-group', 'border-0', 'rounded-0');
  const modal = document.querySelector('#modal');

  const createPosts = (posts) => {
    const links = posts.map((post) => {
      const item = document.createElement('li');
      item.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
      const link = document.createElement('a');
      if (post.viewed) {
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
      previewBtn.textContent = text(['postText.preview']);
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

    cardBodyDiv.append(postHeader);
    cardDiv.append(cardBodyDiv, listItem);
    postsDiv.append(cardDiv);
  };

  createPosts(getLinksToRender(state));
};
