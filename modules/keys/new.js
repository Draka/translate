module.exports = (req, res, next) => {
  const errors = [];
  const fbody = {};
  _.each(req.body, (v, k) => {
    _.set(fbody, k, v);
  });
  const body = _.pick(fbody, [
    'key',
    'text',
    'lang',
  ]);
  body.projectID = req.params.projectID;

  async.auto({
    validate: (cb) => {
      if (!_.trim(body.key)) {
        errors.push({ field: 'key', msg: 'Campo obligatorio.' });
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
    project: ['validate', (results, cb) => {
      models.Project
        .findOne({
          _id: req.params.projectID,
        })
        .exec(cb);
    }],
    query: ['project', (results, cb) => {
      if (!results.project) {
        return cb(listErrors(404, null, [{ field: 'projectID', msg: 'El registro no existe.' }]));
      }
      models.Key
        .findOne({
          projectID: req.params.projectID,
          key: _.lowerCase(body.key),
        })
        .exec(cb);
    }],
    check: ['query', (results, cb) => {
      if (results.query) {
        errors.push({ field: 'key', msg: 'El registro ya existe.' });
        return cb(listErrors(409, null, errors));
      }
      cb();
    }],
    create: ['check', (results, cb) => {
      const model = new models.Key(body);
      model.save(cb);
    }],
  }, (err, results) => {
    if (err) {
      return next(err);
    }
    res.status(201).send(results.create);
  });
};
