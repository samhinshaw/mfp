module.exports = {
  extends: ['airbnb-base', 'prettier'],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'error',
    'no-console': 0,
    'no-underscore-dangle': 0,
  },
  env: {
    node: true,
  },
};
