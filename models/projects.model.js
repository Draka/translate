const schema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  slug: {
    type: String,
    trim: true,
    unique: true,
  },
}, { timestamps: true });

function preUpdate(result, next) {
  if (result.name) {
    result.slug = _.kebabCase(_.deburr(_.get(result, 'name')));
  }
  next();
}

schema.post('validate', preUpdate);

schema.index({ slug: 1 }, { unique: true });
const Model = mongoose.model(`${appCnf.dbPrefix}projects`, schema);

module.exports = Model;
