/* eslint-disable global-require */
const newItem = require('./new');

module.exports = (app) => {
  app.post('/v1/texts', checkAuth, newItem);
};
