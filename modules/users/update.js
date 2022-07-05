module.exports = (req, res, next) => {
  const errors = [];
  const fbody = {};
  _.each(req.body, (v, k) => {
    _.set(fbody, k, v);
  });
  const body = _.pick(fbody, [
    'personalInfo',
    'acceptance',
    'adminStore',
  ]);

  async.auto({
    validate: (cb) => {
      if (body.personalInfo) {
        if (!body.personalInfo.firstname || (_.get(body, 'personalInfo.firstname') || '').length < 3) {
          errors.push({ field: 'firstname', msg: __('Debe escribir un nombre válido') });
        }
        if (!body.personalInfo.lastname || (_.get(body, 'personalInfo.lastname') || '').length < 3) {
          errors.push({ field: 'lastname', msg: __('Debe escribir un apellido válido') });
        }
        if (!body.personalInfo.callsign || (_.get(body, 'personalInfo.callsign') || '').length < 3) {
          errors.push({ field: 'callsign', msg: __('Debe escribir un indicativo válido') });
        }
        const re = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im;

        if (!body.personalInfo.cellphone || !re.test(`${_.get(body, 'personalInfo.callsign')}${_.get(body, 'personalInfo.cellphone')}` || '')) {
          errors.push({ field: 'cellphone', msg: __('Debe escribir un número de célular válido') });
        }
      }
      if (body.acceptance) {
        if (body.acceptance.tycc && body.adminStore) {
          body.acceptance.tycc = {
            check: true,
            date: new Date(),
          };
        }
        if (body.acceptance.tycv) {
          body.acceptance.tycv = {
            check: true,
            date: new Date(),
          };
        }
        if (body.acceptance.pptd) {
          body.acceptance.pptd = {
            check: true,
            date: new Date(),
          };
        }
        if (body.acceptance.adult) {
          body.acceptance.adult = {
            check: true,
            date: new Date(),
          };
        }
      }
      if (errors.length) {
        return cb(listErrors(400, null, errors));
      }
      cb();
    },
    query: ['validate', (results, cb) => {
      models.User
        .findOne({
          tenancy: req.tenancy,
          _id: req.user._id,
        })
        .exec(cb);
    }],
    update: ['query', (results, cb) => {
      results.query.set(body).save(cb);
    }],
  }, (err) => {
    if (err) {
      return next(err);
    }
    res.status(201).send({ status: true });
  });
};
