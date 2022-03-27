import uniqueId from 'lodash/uniqueId.js';

const parser = new DOMParser();

export default (url) => {
  const parsedDoc = parser.parseFromString(url.data.contents, 'application/xml');
  const feedTitle = parsedDoc.querySelector('channel>title').textContent;
  const feedID = uniqueId();
  const feedDescription = parsedDoc.querySelector('channel>description').textContent;
  const feedLink = url.data.status.url;
  const postTitles = Array.from(parsedDoc.querySelectorAll('item>title')).map((item) => item.textContent);
  const postLinks = Array.from(parsedDoc.querySelectorAll('item>link')).map((item) => item.textContent);
  const postDescr = Array.from(parsedDoc.querySelectorAll('item>description')).map((item) => item.textContent);
  const posts = [];
  for (let i = 0; i < postTitles.length; i += 1) {
    posts.push({
      title: postTitles[i], link: postLinks[i], description: postDescr[i], viewed: false,
    });
  }
  return {
    id: feedID,
    title: feedTitle,
    description: feedDescription,
    link: feedLink,
    posts,
  };
};
