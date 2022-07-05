const list = {
  500: {
    status: 500,
    title: 'internalServerError',
    errorMessage: 'internalServerError',
  },
  400: {
    status: 400,
    title: 'badRequest',
    errorMessage: 'badRequest',
  },
  401: {
    status: 401,
    title: 'unauthorized',
    errorMessage: 'unauthorized',
  },
  403: {
    status: 403,
    title: 'forbidden',
    errorMessage: 'forbidden',
  },
  404: {
    status: 404,
    title: 'notFound',
    errorMessage: 'notFound',
  },
  409: {
    status: 409,
    title: 'conflict',
    errorMessage: 'conflict',
  },
  429: {
    status: 429,
    title: 'tooManyRequests',
    errorMessage: 'tooManyRequests',
  },
};

module.exports = (code, res, values) => {
  let err = _.clone(list[code]);
  if (!err) {
    err = list[code.toString()];
    global.__(err.errorMessage || 'internalServerError', code);
  }
  err.code = parseInt(code, 10);
  if (values instanceof Error) {
    err.message = values.message;
    if (process.env.NODE_ENV !== 'production') {
      err.trace = values.stack.split('\n');
    }
  } else {
    err.values = values;
  }

  if (res) {
    return res.status(err.status || 500).send(err);
  }
  return err;
};
