module.exports = (req, res, next) => {
  const body = _.pick(req.query, ['name']);

  const limit = Math.min(Math.max(1, req.query.limit) || 20, 500);
  const page = Math.max(0, req.query.page) || 0;

  async.auto({
    validate: (cb) => {
      if (req.query.q) {
        body.$or = [
          { slug: { $regex: req.query.q, $options: 'i' } },
          { name: { $regex: req.query.q, $options: 'i' } },
        ];
      }
      return cb();
    },
    items: ['validate', (results, cb) => {
      models.Project
        .find(body)
        .limit(limit)
        .skip(limit * page)
        .sort({
          slug: 1,
        })
        .exec(cb);
    }],
    count: ['validate', (_results, cb) => {
      models.Project
        .countDocuments(body)
        .exec(cb);
    }],
  }, (err, results) => {
    if (err) {
      return next(err);
    }
    res.send({
      items: results.items,
      limit,
      page,
      count: results.count,
    });
  });
};
