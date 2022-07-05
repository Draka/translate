module.exports = (req, res, _next) => {
  models.User
    .findOne({
      tenancy: req.tenancy,
      _id: req.user._id,
    })
    .select({
      email: 1,
      nickname: 1,
    })
    .exec((err, doc) => {
      if (err || !doc) {
        return listErrors(401, res);
      }
      res.send(doc);
    });
};
