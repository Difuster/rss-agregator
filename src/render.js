export default (state, i18nInstance) => {
  const renderPosts = () => {
    const postsDiv = document.querySelector('.posts');
    postsDiv.innerHTML = '';
    const cardDiv = document.createElement('div');
    cardDiv.classList.add('card', 'border-0');
    const cardBodyDiv = document.createElement('div');
    cardBodyDiv.classList.add('card-body');
    const h2 = document.createElement('h2');
    h2.classList.add('card-title', 'h4');
    h2.textContent = i18nInstance.t(['outputHeaders.posts']);
    const ul = document.createElement('ul');
    ul.classList.add('list-group', 'border-0', 'rounded-0');
    for (let i = 0; i < state.feedInfo.length; i += 1) {
      const links = state.feedInfo[i].posts.map((item) => {
        const li = document.createElement('li');
        li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
        li.innerHTML = `
          <a href="${item[1]}" class="fw-bold" data-id="2" target="_blank" rel="noopener noreferrer">${item[0]}</a>
          <button type="button" class="btn btn-outline-primary btn-sm" data-id="2" data-bs-toggle="modal"   data-bs-target="#modal">Просмотр</button>
        `;
        return li;
      });
      ul.append(...links);
    }
    cardBodyDiv.append(h2);
    cardDiv.append(cardBodyDiv, ul);
    postsDiv.append(cardDiv);
  };

  const renderFeeds = () => {
    const feedsDiv = document.querySelector('.feeds');
    feedsDiv.innerHTML = '';
    const cardDiv = document.createElement('div');
    cardDiv.classList.add('card', 'border-0');
    const cardBodyDiv = document.createElement('div');
    cardBodyDiv.classList.add('card-body');
    const h2 = document.createElement('h2');
    h2.classList.add('card-title', 'h4');
    h2.textContent = i18nInstance.t(['outputHeaders.feeds']);
    const ul = document.createElement('ul');
    ul.classList.add('list-group', 'border-0', 'rounded-0');
    for (let i = 0; i < state.feedInfo.length; i += 1) {
      const li = document.createElement('li');
      li.classList.add('list-group-item', 'border-0', 'border-end-0');
      li.innerHTML = `
        <h3 class="h6 m-0">${state.feedInfo[i].feedTitle}</h3>
        <p class="m-0 small text-black-50">${state.feedInfo[i].feedDescription}</p>
      `;
      ul.append(li);
    }
    cardBodyDiv.append(h2);
    cardDiv.append(cardBodyDiv, ul);
    feedsDiv.append(cardDiv);
  };

  renderPosts();
  renderFeeds();
};
