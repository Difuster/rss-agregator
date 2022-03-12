const parser = new DOMParser();

export default (url) => {
  const parsedDoc = parser.parseFromString(url.data.contents, 'application/xml');
  const feedTitle = parsedDoc.querySelector('channel>title').textContent;
  const feedDescription = parsedDoc.querySelector('channel>description').textContent;
  const postTitles = Array.from(parsedDoc.querySelectorAll('item>title')).map((item) => item.textContent);
  const postLinks = Array.from(parsedDoc.querySelectorAll('item>link')).map((item) => item.textContent);
  return {
    feedTitle,
    feedDescription,
    postTitles,
    postLinks,
  };
};
