const initState = {
  urlValidation: {
    status: 'idle', // filling, valid, invalid
  },
  feedFetching: {
    status: null, // idle, fetching, finished, failed, updated
  },
  feeds: [],
  posts: [],
  errors: [],
  modal: {
    status: 'hidden',
  },
};

export default initState;
