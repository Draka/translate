module.exports = (req, res, next) => {
  const errors = [];
  const body = _.pick(req.body, ['email', 'password', 'nickname']);

  body.email = _.trim(body.email);
  body.emailNormalized = validator.normalizeEmail(body.email);

  async.auto({
    validate: (cb) => {
      if (!validator.isEmail(body.email)) {
        errors.push({ field: 'email', msg: __('Por favor, escribe una dirección de correo válida.') });
      }
      if ((body.password || '').length < global.minPassword) {
        errors.push({ field: 'password', msg: __('La contraseña debe tener al menos %s caracteres.', global.minPassword) });
      }
      if ((body.nickname || '').length < 3) {
        errors.push({ field: 'nickname', msg: __('Debe escribir un apodo válido') });
      }

      if (errors.length) {
        return cb(listErrors(400, null, errors));
      }
      cb();
    },
    query: ['validate', (_results, cb) => {
      models.User
        .find({
          emailNormalized: body.emailNormalized,
        })
        .exec(cb);
    }],
    check: ['query', (results, cb) => {
      if (results.query.length) {
        errors.push({ field: 'email', msg: __('Ya hay un usuario con este email.') });
        return cb(listErrors(409, null, errors));
      }
      cb();
    }],
    queryNickname: ['validate', (_results, cb) => {
      models.User
        .find({
          nickname: body.nickname,
        })
        .exec(cb);
    }],
    checkNickname: ['queryNickname', (results, cb) => {
      if (results.queryNickname.length) {
        errors.push({ field: 'nickname', msg: __('Ya hay un usuario con este nickname.') });
        return cb(listErrors(409, null, errors));
      }
      cb();
    }],
    create: ['check', 'checkNickname', (_results, cb) => {
      const user = new models.User(body);
      user.save(cb);
    }],
    // mailer: ['create', (results, cb) => {
    //   sqsMailer(req, {
    //     to: { email: body.email, name: results.create.personalInfo.name },
    //     template: 'new-user',
    //   },
    //     results.create,
    //     cb);
    // }],
  }, (err) => {
    if (err) {
      return next(err);
    }
    res.status(201).send(body);
  });
};
