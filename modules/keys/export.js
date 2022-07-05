/* eslint-disable no-await-in-loop */
module.exports = (req, res, next) => {
  const errors = [];
  const fbody = {};
  _.each(req.body, (v, k) => {
    _.set(fbody, k, v);
  });
  const body = _.pick(fbody, [
    'projectID',
    'lang',
  ]);

  async.auto({
    validate: (cb) => {
      if (!_.trim(body.projectID)) {
        errors.push({ field: 'projectID', msg: 'Campo obligatorio.' });
      }
      if (errors.length) {
        return cb(listErrors(400, null, errors));
      }
      cb();
    },
    project: ['validate', (results, cb) => {
      models.Project
        .findOne({
          _id: req.body.projectID,
        })
        .exec(cb);
    }],
    items: ['project', (results, cb) => {
      if (!results.project) {
        return cb(listErrors(404, null, [{ field: 'projectID', msg: 'El registro no existe.' }]));
      }
      models.Key
        .find(body)
        .sort({
          slug: 1,
        })
        .lean()
        .exec(cb);
    }],
    populate: ['items', async (results) => {
      for (let i = 0; i < results.items.length; i++) {
        const k = results.items[i];
        k.texts = await models.Text.find({ keyID: k._id, lang: req.params?.lang || 'en' }).sort({ votes: -1 });
      }
    }],
    texts: ['populate', async (results) => {
      const t = {};
      results.items.forEach((i) => {
        t[i.key] = i.texts[0]?.text || i.text;
      });
      return t;
    }],
  }, (err, results) => {
    if (err) {
      return next(err);
    }
    res.send({
      text: JSON.stringify(results.texts, null, ' '),
    });
  });
};
