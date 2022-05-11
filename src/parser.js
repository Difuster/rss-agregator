import uniqueId from 'lodash/uniqueId.js';

const parser = new DOMParser();

export default (rss, url) => {
  const parsedDoc = parser.parseFromString(rss.data.contents, 'application/xml');
  if (parsedDoc.querySelector('parsererror')) {
    throw new Error('RSSError');
  }
  const feedTitle = parsedDoc.querySelector('channel>title').textContent;
  const feedId = uniqueId();
  const feedDescription = parsedDoc.querySelector('channel>description').textContent;
  const feedLink = url;
  const postTitles = Array.from(parsedDoc.querySelectorAll('item>title')).map((item) => item.textContent);
  const postLinks = Array.from(parsedDoc.querySelectorAll('item>link')).map((item) => item.textContent);
  const postDescr = Array.from(parsedDoc.querySelectorAll('item>description')).map((item) => item.textContent);
  const posts = [];
  for (let i = 0; i < postTitles.length; i += 1) {
    posts.push({
      feedId,
      id: uniqueId(),
      title: postTitles[i],
      link: postLinks[i],
      description: postDescr[i],
      viewed: false,
    });
  }

  const feed = {
    id: feedId,
    title: feedTitle,
    description: feedDescription,
    link: feedLink,
  };

  return {
    feed,
    posts,
  };
};
