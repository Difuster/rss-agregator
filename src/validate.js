import * as yup from 'yup';

export default (link, feeds) => {
  yup.setLocale({
    mixed: {
      notOneOf: 'notOneOf',
    },
    string: {
      url: 'validationError',
    },
  });
  const schema = yup.string().url().notOneOf(feeds);
  return schema.validate(link);
};
