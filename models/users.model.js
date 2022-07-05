const crypto = require('crypto');

const config = {
  hashBytes: 32,
  saltBytes: 16,
  iterations: 872791,
};

function hash(obj, key) {
  return new Promise((resolve, reject) => {
    if (!obj[key]) {
      return resolve();
    }
    crypto.randomBytes(config.saltBytes, (err, salt) => {
      if (err) {
        return reject(err);
      }

      crypto.pbkdf2(obj[key], salt.toString('hex'), config.iterations, config.hashBytes, 'sha512',
        (err, hash) => {
          if (err) {
            return reject(err);
          }
          obj[key] = `${salt.toString('hex')}:${config.iterations}:${config.hashBytes}:${hash.toString('hex')}`;
          resolve();
        });
    });
  });
}

function preUpdate(result, next) {
  if (!this.isModified('password') && !this.isNew) {
    return next();
  }
  Promise.all(['password', 'passwordTemp'].map((field) => hash(result, field))).then(() => next(), (err) => next(err));
}

const schema = new mongoose.Schema({
  email: {
    type: String,
    trim: true,
    required: true,
  },
  emailNormalized: {
    type: String,
    trim: true,
    unique: true,
    required: true,
    validate: {
      validator(v) {
        return /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(v);
      },
    },
  },
  password: {
    type: String,
    trim: true,
    required: true,
  },
  passwordTemp: {
    type: String,
    trim: true,
  },
  nickname: {
    type: String,
    unique: true,
    trim: true,
  },
  active: {
    type: Boolean,
    index: true,
    default: true,
  },
  admin: {
    type: Boolean,
    index: true,
    default: false,
  },
}, { timestamps: true });

schema.post('validate', preUpdate);
const Model = mongoose.model(`${appCnf.dbPrefix}users`, schema);

module.exports = Model;
