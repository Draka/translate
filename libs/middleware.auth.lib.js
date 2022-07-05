const jwt = require('jsonwebtoken');

function isAuthenticated(token) {
  try {
    return jwt.verify(token, appCnf.keySecret);
  } catch (err) {
    return false;
  }
}

module.exports = (req, res, next) => {
  global.originalUrl = ((req.originalUrl.split('?'))[0]).substring(1);
  console.log(global.originalUrl);
  const token = req.headers?.authorization;
  const payload = isAuthenticated(token);

  if (payload) {
    req.user = payload;
    return next();
  }
  next();
};
