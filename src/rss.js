import _ from 'lodash';
import parseUrl from './parser';

const axios = require('axios');

const getRSS = (url, watchedState) => {
  axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`)
    .then((response) => {
      watchedState.feedInfo.unshift(parseUrl(response));
      watchedState.status = 'resolved';
    })
    .catch((error) => error);
};

const updateRSS = (feedInfo) => {
  const updateUrlParsing = (url) => axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`)
    .then((response) => parseUrl(response))
    .catch((error) => error);
  const getDifference = () => {
    feedInfo.forEach((feed) => {
      updateUrlParsing(feed.link)
        .then((newFeed) => {
          const newPosts = _.differenceWith(newFeed.posts, feed.posts, _.isEqual);
          if (newPosts.length !== 0) {
            feed.posts = [...newPosts, ...feed.posts];
          }
        })
        .catch((e) => e);
    });
  };
  getDifference();
};

export { getRSS, updateRSS };
