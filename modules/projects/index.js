/* eslint-disable global-require */
const listItems = require('./list');
const newItem = require('./new');
const editItem = require('./edit');

module.exports = (app) => {
  app.get('/v1/projects', checkAuth, listItems);
  app.post('/v1/projects', checkAuth, newItem);
  app.put('/v1/projects/:projectID', checkAuth, editItem);
};
