module.exports = (req, res, next) => {
  const errors = [];
  const fbody = {};
  _.each(req.body, (v, k) => {
    _.set(fbody, k, v);
  });
  const body = _.pick(fbody, [
    'keyID',
    'text',
    'lang',
  ]);

  async.auto({
    validate: (cb) => {
      if (!_.trim(body.keyID)) {
        errors.push({ field: 'keyID', msg: 'Campo obligatorio.' });
      }
      if (!_.trim(body.text)) {
        errors.push({ field: 'text', msg: 'Campo obligatorio.' });
      }
      if (!_.trim(body.lang)) {
        errors.push({ field: 'lang', msg: 'Campo obligatorio.' });
      }
      if (errors.length) {
        return cb(listErrors(400, null, errors));
      }
      cb();
    },
    key: ['validate', (results, cb) => {
      models.Key
        .findOne({
          _id: req.body.keyID,
        })
        .exec(cb);
    }],
    query: ['key', (results, cb) => {
      if (!results.key) {
        return cb(listErrors(404, null, [{ field: 'keyID', msg: 'El registro no existe.' }]));
      }
      cb();
    }],
    save: ['query', async (results) => {
      let model = await models.Text
        .findOne({
          keyID: body.keyID,
          userID: req.user._id,
          lang: _.lowerCase(body.lang),
        });
      if (model) {
        model.text = body.text;
        await model.save();
      } else {
        model = new models.Text({
          keyID: body.keyID,
          userID: req.user._id,
          text: body.text,
          lang: _.lowerCase(body.lang),
        });
      }
      await model.save();
      return model;
    }],
  }, (err, results) => {
    if (err) {
      return next(err);
    }
    res.status(201).send(results.save);
  });
};
