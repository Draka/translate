global._ = require('lodash');
global.mongoose = require('mongoose');
global.async = require('async');
global.validator = require('validator');

global.listErrors = require('./libs/list_errors.lib');
global.checkAuth = require('./libs/check_auth.lib');

const vars = {
  tz: 'America/Bogota',
  bookTicker: {},
  minPassword: 6,
  __: (str, a1, a2) => str.replace('%s', a1).replace('%s', a2),
};
_.forEach(vars, (v, i) => {
  global[i] = v;
});
