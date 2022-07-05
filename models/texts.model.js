const schema = new mongoose.Schema({
  keyID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: `${appCnf.dbPrefix}keys`,
    index: true,
  },
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: `${appCnf.dbPrefix}users`,
    index: true,
  },
  text: {
    type: String,
    trim: true,
  },
  lang: {
    type: String,
    trim: true,
    index: true,
  },
  likes: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

schema.index({ keyID: 1, userID: 1, lang: 1 }, { unique: true });
const Model = mongoose.model(`${appCnf.dbPrefix}texts`, schema);

module.exports = Model;
