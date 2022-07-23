import _ from 'lodash';
import downloadRSS from './rss.js';
import parseRSS from './parser.js';

export default (state) => {
  const promises = state.feeds.map((feed) => {
    const rss = downloadRSS(feed.link);
    rss
      .then((response) => {
        const newFeed = parseRSS(response, feed.link);
        const oldFeedTitles = state.posts.map((item) => item.title);
        const newFeedTitles = newFeed.posts.map((item) => item.title);
        const newTitles = _.differenceWith(newFeedTitles, oldFeedTitles, _.isEqual);
        newTitles.reverse().forEach((title) => {
          const newPost = newFeed.posts.filter((post) => post.title === title);
          state.posts = [...newPost, ...state.posts];
        });
      });
    return rss;
  });

  return Promise.all(promises);
};
