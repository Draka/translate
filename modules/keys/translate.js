/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
const needle = require('needle');

const apiKey = 'AIzaSyCHBnmNwHc1a6voBSAOZCZOfAhiYAeKOhY';

module.exports = (req, res, next) => {
  const errors = [];
  const fbody = {};
  _.each(req.body, (v, k) => {
    _.set(fbody, k, v);
  });
  const body = _.pick(fbody, [
    'text',
  ]);
  const source = body.source || 'es';
  const target = body.target || 'en';

  async.auto({
    validate: (cb) => {
      if (!_.trim(body.text)) {
        errors.push({ field: 'text', msg: 'Campo obligatorio.' });
      }
      if (errors.length) {
        return cb(listErrors(400, null, errors));
      }
      cb();
    },
    translateText: ['validate', async (_results) => {
      const data = {
        q: body.text,
        format: 'text', // mime types: text/plain, text/html
        source,
        target,
      };
      const response = await needle('post', `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`, data);
      return response.body;
    }],
  }, (err, results) => {
    if (err) {
      return next(err);
    }
    res.status(201).send(results.translateText.data.translations[0]);
  });
};
