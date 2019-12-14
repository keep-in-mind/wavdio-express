const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const http = require('http');
const createError = require('http-errors');
const path = require('path');
const rfs = require('rotating-file-stream');
const favicon = require('serve-favicon');
const morganLogger = require('morgan');
const xss = require('xss-clean');
const commandLineArgs = require('command-line-args');

const museumRouter = require('./routes/museum');
const expositionRouter = require('./routes/exposition');
const exhibitRouter = require('./routes/exhibit');
const infopageRouter = require('./routes/infopage');
const uploadRouter = require('./routes/upload');
const loggingRouter = require('./routes/logging');
const userRouter = require('./routes/user');
const userSchema = require('./models/user');
const museumSchema = require('./models/museum');

const app = express();
app.use(express.urlencoded({extended: true}));
app.use(express.json());
// app.use(xss());
app.use('/api/v2', museumRouter);
app.use('/api/v2', expositionRouter);
app.use('/api/v2', exhibitRouter);
app.use('/api/v2', infopageRouter);
app.use('/upload', uploadRouter);
app.use('/api/v2', userRouter);

//////////////////////////////////////////////////////////////
//                Parse comand line args                    //
//////////////////////////////////////////////////////////////

const optionDefinitions = [
  { name: 'db-host', type: String },
  { name: 'db-port', type: Number },
  { name: 'db-name', type: String },
  { name: 'port', type: Number }
]

const options = commandLineArgs(optionDefinitions)

settingsDefault = {
  db: {
    host: options['db-host'] || 'localhost',
    port: options['db-port'] || 27017,
    name: options['db-name'] || 'wAVdioDB'
  },
  server: {
    port: options['port'] || 3000
  }
};

//////////////////////////////////////////////////////////////
//                Captive Portal Rederictions               //
//////////////////////////////////////////////////////////////

app.all('/redirect',function (req, res){
  res.redirect('/');
});

app.all('/generate_204',function (req, res){
  res.redirect('/');
});

//////////////////////////////////////////////////////////////
//             End Captive Portal Rederictions              //
//////////////////////////////////////////////////////////////

app.use('/api/v2/logs', loggingRouter);

//////////////////////////////////////////////////////////////
//                        LOGGING                           //
//////////////////////////////////////////////////////////////

/////////////////// MORGAN - EXPRESS-LOGGER //////////////////

const loggerFormat = ':date[web] - :status - :method - :url :' +
  ' \n\t Remote Adress: :remote-addr \n\t Request Header: :req[header]' +
  ' \n\t Response Header: :res[header] \n\t ResponseTime: :response-time ms';

// create a rotating write stream
const accessLogStream = rfs('express.log', {
  size: "10000000B", // rotate every 10 MegaBytes written
  interval: "1d", // rotate daily
  maxFiles: 1,
  path: "logs"
});

app.use(morganLogger(loggerFormat, {
  stream: accessLogStream
}));

//////////////////////////////////////////////////////////////
//                       END LOGGING                        //
//////////////////////////////////////////////////////////////

// database driver

mongoose.Promise = require('bluebird');

async function connectDB(host = "localhost", port = 27017, dbName = "wAVdioDB") {
  let uri = `mongodb://${host}:${port}/${dbName}`;
  console.log(`Connect to mongodb server on ${host}:${port}`);
  return mongoose.connect(
    uri, {useMongoClient: true});
}


app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist/wAVdio')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('*', express.static(path.join(__dirname, 'dist/wAVdio')));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.sendStatus(err.status);
});

//////////

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

const server = http.createServer(app);

const debug = require('debug')('wAVdio:server');

function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('wAVdio is listening on ' + bind);
}

server.on('error', onError);
server.on('listening', onListening);

/**
 * Export functios to start and stop the server
 */

module.exports.listen = async function (settings = settingsDefault) {
  try {
    await connectDB(settings.db.host, settings.db.port, settings.db.name);
    console.log('MongoDB connection established');
    this.server.listen(settings.server.port);

    let userquery = {
      'session_id': 'e588af213c2af8ec42823e840f7b6539a9a5e8e718dbfe84e383ac1c460791012a96793740027ab4c7c6954e17e8815c16a9d4605f61ef2012af07695dce996532ab751e0ca759c2f08bcd4f345ec1ca8f119b460def150a69b3023dc3dc6c833f52c010ff1917a4c5bbdda4fe7a82a2eec56638f8f7751c298e9bb43d77d2dada8d73c9b99e08d156d9581afe4f6af04b81ca0a2900615e1349e11b39f249b613d287945833289e89b91f11bff089d718b233731c706dab10d3f71fac7feec12d980b94e8fefe40d6570c7ef44003aec341527d62695e5128a22e0311a2478eee6af14d7224b73315660c4c9b3b3de3dfb6d96165b666fa6ed4d725eac7b9303eeb2666feba7e2dfcedf306a47d09eaac5b31fc378e9a6b2b6ac86b1d7a73203fef3bbcd5b6b943de1ddaeb8bd3add5a2831ef01de55f37fb2df7042f7d6652ae9dbe91821772c950f5c7f8e07860ccb5fb6c1296fe080b2bd5f4b3ede62ff59fbfedd36f81ebfa67460fa311ba8c37bb7b2a0c355cb0f8fa599b4f17efe963f6f668aec68ce148871a933bf755207c3c243b176ae6b4d6b2b9fcd181d6e3e3a16e477d67ba61ec91015006612b25ea39fa422352ebd627882826d5d388a3b7a2a5358f4444f5c6f48ea786e40e1175aa26eada8024a0422bc4838e8499454b77c694937b704d1ed25b178bb223c9a42edbc4dc23c2fe8be9b4b9ac79f65e43',
      'hash': 'f5feae01aabaa38251fde4cdf7cb32f83b48fb8b646a93632a4bf3d0e87f9c82f54783f1b16b135d54d732ea5620d669b90bbd83ef1b19a22e58d53d30619da5',
      'salt': '244604cf5d7bf393cf8fd4dcc45e2ae2',
      'username': 'admin'
    };

    userSchema.findOne({}, function (err, user) {
      if (!user) {
        userSchema.create(userquery, (err, user) => {
          if (err) {
            console.log(err)
          } else {
            console.log('Login has been created. Name: admin - Password: hsrm. Please change your credentials');
          }
        });
      } else {
        console.log('Login already exists - skipped')
      }
    });

    let museumquery = {
      'logo': null,
      'contents': [{
        'lang': 'en',
        'name': 'New museum',
        'welcomeText': 'Welcome!',
        'sitePlan': null,
        'termsOfUse': 'Terms of use...',
        'privacyTerms': 'Privacy statement...',
      }, {
        'lang': 'de',
        'name': 'Neues Museum',
        'welcomeText': 'Willkommen!',
        'sitePlan': null,
        'termsOfUse': 'Nutzungsbedingungen...',
        'privacyTerms': 'Datenschutzrichtlinie...',
      }]
    };

    museumSchema.findOne({}, function (err, museum) {
      if (!museum) {
        museumSchema.create(museumquery, (err, museum) => {
          if (err) {
            console.log(err)
          } else {
            console.log('Museum has been created. Can be changed in the admin interface');
          }
        });
      } else {
        console.log('Museum already exists - skipped')
      }
    });

  } catch (err) {
    console.error(err);
  }
};

module.exports.close = function (callback) {
  this.server.close(callback);
  console.log('Server closed')
};

module.exports.server = server;
module.exports.defaultSettings = settingsDefault;
