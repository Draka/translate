module.exports = (req, res, next) => {
  const errors = [];
  const fbody = {};
  _.each(req.body, (v, k) => {
    _.set(fbody, k, v);
  });
  const body = _.pick(fbody, [
    'name',
    'description',
  ]);

  async.auto({
    validate: (cb) => {
      if (!_.trim(body.name)) {
        errors.push({ field: 'name', msg: 'Campo obligatorio.' });
      }
      if (errors.length) {
        return cb(listErrors(400, null, errors));
      }
      cb();
    },
    query: ['validate', (_results, cb) => {
      models.Project
        .findOne({ slug: _.kebabCase(_.deburr(body.name)) })
        .exec(cb);
    }],
    check: ['query', (results, cb) => {
      if (results.query) {
        errors.push({ field: 'slug', msg: 'El registro ya existe.' });
        return cb(listErrors(409, null, errors));
      }
      cb();
    }],
    create: ['check', (results, cb) => {
      const model = new models.Project(body);
      model.save(cb);
    }],
  }, (err, results) => {
    if (err) {
      return next(err);
    }
    res.status(201).send(results.create);
  });
};
