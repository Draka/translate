const signup = require('./signup');
const login = require('./login');
const me = require('./me');
// const passwordReset = require('./password_reset');

module.exports = (app) => {
  app.post('/v1/user/signup', signup);
  app.post('/v1/user/signin', login);
  app.get('/v1/account/status', checkAuth, me);
  // app.post('/v1/users/password-reset', passwordReset);
};
