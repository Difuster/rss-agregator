import axios from 'axios';
import _ from 'lodash';
import parseUrl from './parser.js';

const downloadRSS = (url) => axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`);

const updateRSS = (feeds, state, i18nInstance, showErr) => {
  const updateParsedUrl = (url) => axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`)
    .then((response) => parseUrl(response))
    .catch((error) => {
      state.error = i18nInstance.t([`errMessages.${error.message}`]);
      showErr(state.error, true);
    });

  const getDifference = () => {
    feeds.forEach((feed) => {
      updateParsedUrl(feed.link)
        .then((newFeed) => {
          const oldFeedTitles = feed.posts.map((item) => item.title);
          const newFeedTitles = newFeed.posts.map((item) => item.title);
          const newTitles = _.differenceWith(newFeedTitles, oldFeedTitles, _.isEqual);
          newTitles.reverse().forEach((title) => {
            const newPost = newFeed.posts.filter((post) => post.title === title);
            feed.posts = [...newPost, ...feed.posts];
          });
        })
        .catch((error) => {
          state.error = i18nInstance.t([`errMessages.${error.message}`]);
          showErr(state.error, true);
        });
    });
  };

  getDifference();
};

export { downloadRSS, updateRSS };
