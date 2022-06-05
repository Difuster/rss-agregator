import renderPosts from './posts.js';

export default (state, text) => {
  const feedDiv = document.querySelector('.feeds');
  feedDiv.innerHTML = '';
  const cardDiv = document.createElement('div');
  cardDiv.classList.add('card', 'border-0');
  const cardBodyDiv = document.createElement('div');
  cardBodyDiv.classList.add('card-body');
  const cardHeader = document.createElement('h2');
  cardHeader.classList.add('card-title', 'h4');
  cardHeader.textContent = text(['outputHeaders.feeds']);
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
      state.feeds.map((item) => {
        item.id === feed.id ? item.checked = true : item.checked = false;
        return item;
      });
      renderPosts(state, text);
    });
  });

  cardBodyDiv.append(cardHeader);
  cardDiv.append(cardBodyDiv, ul);
  feedDiv.append(cardDiv);
};
