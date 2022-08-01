/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
module.exports = (req, res, next) => {
  const errors = [];
  const fbody = {};
  _.each(req.body, (v, k) => {
    _.set(fbody, k, v);
  });
  const body = _.pick(fbody, [
    'json',
    'projectID',
  ]);

  async.auto({
    validate: (cb) => {
      if (!_.trim(body.projectID)) {
        errors.push({ field: 'projectID', msg: 'Campo obligatorio.' });
      }
      if (!_.trim(body.json)) {
        errors.push({ field: 'json', msg: 'Campo obligatorio.' });
      }
      try {
        body.json = JSON.parse(body.json);
      } catch (error) {
        errors.push({ field: 'json', msg: 'Json con errores.' });
      }
      if (errors.length) {
        return cb(listErrors(400, null, errors));
      }
      cb();
    },
    project: ['validate', (results, cb) => {
      models.Project
        .findOne({
          _id: body.projectID,
        })
        .exec(cb);
    }],
    query: ['project', async (results) => {
      if (!results.project) {
        return listErrors(404, null, [{ field: 'projectID', msg: 'El registro no existe.' }]);
      }
      for (const key in body.json) {
        if (Object.hasOwnProperty.call(body.json, key)) {
          const text = body.json[key];
          if (text) {
            let model = await models.Key.findOne({ projectID: body.projectID, key });
            if (model) {
              // el modelo existe, si es diferente debe actalizar las traducciones
              if (model.text !== text) {
                model.text = text;
                await model.save();
                await models.Text.deleteMany({ keyID: model._id });
              }
            } else {
              model = new models.Key({
                projectID: body.projectID,
                key,
                text,
                lang: 'es',
              });
            }
            await model.save();
          }
        }
      }
    }],
  }, (err, results) => {
    if (err) {
      return next(err);
    }
    res.status(201).send({ ok: true });
  });
};
