/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
const { lstatSync, readdirSync } = require('fs');
const { join } = require('path');

module.exports = (app) => {
  const isDirectory = (source) => lstatSync(source).isDirectory();

  const getDirectories = (source) => readdirSync(source).map((name) => join(source, name)).filter(isDirectory);
  _.forEach(getDirectories(__dirname), (d) => {
    require(d)(app);
  });

  const w = _.random(10000);
  app.get('/status', (req, res) => {
    const memory = process.memoryUsage();
    res.send({
      w,
      v: appCnf.v,
      rss: memory.rss / 1048576,
      heapTotal: memory.heapTotal / 1048576,
      heapUsed: memory.heapUsed / 1048576,
      host: _.get(req, 'site.url'),
      realip: req.headers['X-Real-IP'] || req.connection.remoteAddress,
      ip: req.headers['X-Forwarder-For'] || req.connection.remoteAddress,
    });
  });
};
