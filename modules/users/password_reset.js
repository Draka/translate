const bcrypt = require('bcrypt');
const sqsMailer = require('../../../libs/sqs-mailer.lib');

function hash(obj, key) {
  return new Promise((resolve, reject) => {
    if (!obj[key]) {
      resolve();
    }
    bcrypt.genSalt(10, (err, salt) => {
      if (err) {
        return reject(err);
      }
      bcrypt.hash(obj[key], salt, (err, hash) => {
        if (err) {
          return reject(err);
        }
        obj[key] = hash;
        resolve();
      });
    });
  });
}

module.exports = (req, res, next) => {
  const errors = [];
  const passwordTemp = Math.random().toString(36).slice(-8);
  req.body.passwordTemp = passwordTemp;
  Promise.all(['passwordTemp'].map((field) => hash(req.body, field))).then(() => {
    async.auto({
      query: (cb) => {
        models.User
          .findOne({
            tenancy: req.tenancy,
            emailNormalized: validator.normalizeEmail(req.body.email),
          })
          .select({
            email: 1,
            personalInfo: 1,
          })
          .exec(cb);
      },
      check: ['query', (results, cb) => {
        if (!results.query) {
          errors.push({ field: 'email', msg: 'Correo no registrado.' });
        }
        if (errors.length) {
          return cb(listErrors(400, null, errors));
        }
        cb();
      }],
      update: ['check', (results, cb) => {
        results.query.set({
          passwordTemp: req.body.passwordTemp,
        }).save(cb);
      }],
      mailer: ['update', (results, cb) => {
        if (!results.query) {
          return cb();
        }
        sqsMailer(req, {
          to: { email: results.query.email, name: results.query.personalInfo.name },
          template: 'password-reset',
          passwordTemp,
        },
        results.query,
        cb);
      }],
    }, (err) => {
      if (err) {
        return next(err);
      }
      res.send({ status: true });
    });
  }, (err) => next(err));
};
