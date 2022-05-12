import _ from 'lodash';
import downloadRSS from './rss.js';
import parseRSS from './parser.js';

export default (data) => {
  data.feeds.forEach((feed) => {
    const rss = downloadRSS(feed.link);
    rss
      .then((response) => {
        const newFeed = parseRSS(response, feed.link);
        const oldFeedTitles = data.posts.map((item) => item.title);
        const newFeedTitles = newFeed.posts.map((item) => item.title);
        const newTitles = _.differenceWith(newFeedTitles, oldFeedTitles, _.isEqual);
        newTitles.reverse().forEach((title) => {
          const newPost = newFeed.posts.filter((post) => post.title === title);
          data.posts = [...newPost, ...data.posts];
        });
      });
  });
};
