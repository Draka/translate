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
      if (!_.trim(body.question)) {
        errors.push({ field: 'name', msg: 'Campo obligatorio.' });
      }
      if (errors.length) {
        return cb(listErrors(400, null, errors));
      }
      cb();
    },
    query: ['validate', (_results, cb) => {
      models.Project
        .findOne({
          _id: req.params.projectID,
        })
        .exec(cb);
    }],
    save: ['query', (results, cb) => {
      if (!results.query) {
        errors.push({ field: 'project', msg: 'El registro no existe.' });
      }
      if (errors.length) {
        return cb(listErrors(400, null, errors));
      }
      results.query.set(body).save(cb);
    }],
  }, (err, results) => {
    if (err) {
      return next(err);
    }
    res.status(201).send(results.save);
  });
};
