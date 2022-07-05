/* eslint-disable no-console */
require('./constants');
global.appCnf = require('./appCnf');

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const logger = require('morgan');
const cors = require('cors');

const auth = require('./libs/middleware.auth.lib');

mongoose.Promise = require('bluebird');

if (process.env.NODE_ENV !== 'production') {
  mongoose.set('debug', true);
}
const dbOptions = {
  autoIndex: true, // Don't build indexes
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  family: 4, // Use IPv4, skip trying IPv6
};
mongoose.connect(appCnf.db, dbOptions).then(
  () => {
    console.log(`MongoDB conectdo a: ${appCnf.db}`);
  },
  (err) => {
    console.log('MongoDB error', appCnf.db, err);
    process.exit(1);
  },
);
// modelos
global.models = require('./models');

const app = express();
if (process.env.NODE_ENV === 'production') {
  app.use(cors({
    origin: [/\.protobot\.finance$/],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  }));
} else {
  app.use(cors());
}

// view engine setup
app.locals.basedir = __dirname;

app.use(logger('dev'));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(auth);

require('./modules')(app);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  if (process.env.NODE_ENV === 'production' && err.status !== 404) {
    res.locals.error = {};
    err.stack = '';
  } else if (err.status !== 401 && err.status !== 404) {
    // console.log('-------------------------------------------------');
    console.error(err);
  }
  res.status(err.status || 500).send(err);
});

module.exports = app;
