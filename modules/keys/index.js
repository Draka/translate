/* eslint-disable global-require */
const listItems = require('./list');
const newItem = require('./new');
const editItem = require('./edit');
const importItem = require('./import');
const exportItem = require('./export');
const translate = require('./translate');

module.exports = (app) => {
  app.get('/v1/keys/:projectID', checkAuth, listItems);
  app.post('/v1/keys/import', checkAuth, importItem);
  app.post('/v1/keys/export', checkAuth, exportItem);
  app.post('/v1/keys/:projectID', checkAuth, newItem);
  app.put('/v1/keys/:keyID', checkAuth, editItem);
  app.post('/v1/translate', translate);
};
