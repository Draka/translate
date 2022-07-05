const crypto = require('crypto');
const jwt = require('jsonwebtoken');

function comparePassword(password, str) {
  return new Promise((resolve, reject) => {
    if (!str) {
      return resolve(false);
    }
    const combined = str.split(':');

    crypto.pbkdf2(password, combined[0], parseInt(combined[1], 10), parseInt(combined[2], 10), 'sha512', (err, verify) => {
      if (err) {
        return reject(err);
      }

      resolve(verify.toString('hex') === combined[3]);
    });
  });
}

function generateToken(req, user, secret) {
  const date = new Date();

  const payload = {
    iss: 'localhost',
    _id: user._id,
    admin: user.admin,
    iat: date.getTime(),
    exp: (new Date(date.setFullYear(date.getFullYear() + 1))).getTime(),
  };
  return jwt.sign(payload, secret);
}

module.exports = (req, res, next) => {
  const errors = [];
  const body = _.pick(req.body, ['email', 'password']);

  body.email = _.trim(body.email);
  async.auto({
    validate: (cb) => {
      if (!validator.isEmail(body.email)) {
        errors.push({ field: 'email', msg: __('Por favor, escribe una dirección de correo válida.') });
      }
      if (!body.password || body.password.length < global.minPassword) {
        errors.push({ field: 'password', msg: __('La contraseña debe tener al menos %s caracteres.', global.minPassword) });
      }
      if (errors.length) {
        return cb(listErrors(400, null, errors));
      }
      cb();
    },
    query: ['validate', (results, cb) => {
      models.User
        .findOne({
          emailNormalized: validator.normalizeEmail(req.body.email),
        })
        .select({
          admin: 1,
          password: 1,
          passwordTemp: 1,
          nickname: 1,
          email: 1,
          emailNormalized: 1,
        })
        .exec(cb);
    }],
    token: ['query', (results, cb) => {
      if (!results.query) {
        errors.push({ field: 'email', msg: __('Correo electrónico o Contraseña inválidos.') });
        return cb(listErrors(401, null, errors));
      }
      Promise.all(['password', 'passwordTemp'].map((field) => comparePassword(req.body.password, results.query[field]))).then((rp) => {
        if (!rp[0] && !rp[1]) {
          errors.push({ field: 'email', msg: __('Correo electrónico o Contraseña inválidos.') });
          return cb(listErrors(401, null, errors));
        }
        cb(null, generateToken(req, results.query, appCnf.keySecret));
      }, (err) => cb(err));
    }],
  }, (err, results) => {
    if (err) {
      return next(err);
    } if (!results.query) {
      return listErrors(401, res);
    }
    res.send({ token: results.token, user: _.pick(results.query, ['_id', 'email', 'nickname']) });
  });
};
