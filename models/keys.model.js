const schema = new mongoose.Schema({
  projectID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: `${appCnf.dbPrefix}projects`,
    index: true,
    required: true,
  },
  key: {
    type: String,
    trim: true,
    index: true,
    required: true,
  },
  text: {
    type: String,
    trim: true,
    required: true,
  },
  lang: {
    type: String,
    trim: true,
    required: true,
  },
}, { timestamps: true });

function preUpdate(result, next) {
  if (result.key) {
    result.key = result.key.toLowerCase();
  }
  next();
}
schema.post('validate', preUpdate);

schema.index({ projectID: 1, key: 1 }, { unique: true });
const Model = mongoose.model(`${appCnf.dbPrefix}keys`, schema);

module.exports = Model;
