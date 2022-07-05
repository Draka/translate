/* eslint-disable no-await-in-loop */
module.exports = (req, res, next) => {
  const body = _.pick(req.query, ['key']);

  const limit = Math.min(Math.max(1, req.query.limit) || 200, 500);
  const page = Math.max(0, req.query.page) || 0;

  async.auto({
    validate: (cb) => {
      if (req.query.q) {
        body.$or = [
          { key: { $regex: req.query.q, $options: 'i' } },
          { text: { $regex: req.query.q, $options: 'i' } },
        ];
      }
      body.projectID = req.params.projectID;
      return cb();
    },
    project: ['validate', (results, cb) => {
      models.Project
        .findOne({
          _id: req.params.projectID,
        })
        .exec(cb);
    }],
    items: ['project', (results, cb) => {
      if (!results.project) {
        return cb(listErrors(404, null, [{ field: 'projectID', msg: 'El registro no existe.' }]));
      }
      models.Key
        .find(body)
        .limit(limit)
        .skip(limit * page)
        .sort({
          slug: 1,
        })
        .lean()
        .exec(cb);
    }],
    count: ['project', (_results, cb) => {
      models.Key
        .countDocuments(body)
        .exec(cb);
    }],
    populate: ['items', async (results) => {
      for (let i = 0; i < results.items.length; i++) {
        const k = results.items[i];
        k.texts = await models.Text.find({ keyID: k._id, lang: req.params?.lang || 'en' }).populate({
          path: 'userID',
          select: 'nickname',
        });
      }
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
