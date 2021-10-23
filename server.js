#!/usr/bin/env node

const bluebird = require('bluebird')
const commandLineArgs = require('command-line-args')
const commandLineUsage = require('command-line-usage')
const createError = require('http-errors')
const express = require('express')
const http = require('http')
const migrate = require('migrate')
const mongoose = require('mongoose')
const morganLogger = require('morgan')
const path = require('path')
const rotatingFileStream = require('rotating-file-stream')

const config = require('./config')
const exhibitRouter = require('./routes/exhibit')
const expositionRouter = require('./routes/exposition')
const infopageRouter = require('./routes/infopage')
const loggingRouter = require('./routes/logging')
const migrate_db = require('./migrate_db')
const museumRouter = require('./routes/museum')
const settingRouter = require('./routes/setting')
const uploadRouter = require('./routes/upload')
const userRouter = require('./routes/user')

const app = express()

app.use(express.urlencoded({extended: true}))
app.use(express.json())

app.use('/api/v2', exhibitRouter)
app.use('/api/v2', expositionRouter)
app.use('/api/v2', infopageRouter)
app.use('/api/v2', loggingRouter)
app.use('/api/v2', museumRouter)
app.use('/api/v2', settingRouter)
app.use('/api/v2', userRouter)
app.use('/upload', uploadRouter)

app.get('/', (req, res) =>
  res.status(200).send('Server is up'))

//
// Command Line Args
//

const optionDefinitions = [
  {name: 'db-host', type: String},
  {name: 'db-port', type: Number},
  {name: 'db-name', type: String},
  {name: 'db-uri', type: String},
  {name: 'port', type: Number},
  {name: 'help', type: Boolean},
]

const options = commandLineArgs(optionDefinitions)
process.env.DB_URI = options['db-uri'] || process.env.DB_URI || 'mongodb://localhost:27017/wavdio-express'

if (options['help']) {
  const sections = [
    {
      header: 'Options',
      optionList: [
        {
          name: 'db-host',
          typeLabel: '{underline string}',
          description: 'MongoDB host, default: localhost'
        },
        {
          name: 'db-port',
          typeLabel: '{underline number}',
          description: 'MongoDB port, default: 27017'
        },
        {
          name: 'db-name',
          typeLabel: '{underline string}',
          description: 'MongoDB host, default: wavdio'
        },
        {
          name: 'db-uri',
          typeLabel: '{underline string}',
          description: 'MongoDB URI'
        },
        {
          name: 'port',
          typeLabel: '{underline number}',
          description: 'Express host, default: 3000'
        },
        {
          name: 'help',
          typeLabel: ' ',
          description: 'Print this usage guide'
        }
      ]
    }
  ]

  const usage = commandLineUsage(sections)
  console.log(usage)

  process.exit()
}

const settingsDefault = {
  db: {
    host: options['db-host'] || 'localhost',
    port: options['db-port'] || 27017,
    name: options['db-name'] || 'wAVdioDB'
  },
  server: {
    port: options['port'] || process.env.PORT || 3000
  }
}

//
// Captive Portal Redirections
//

app.all('/redirect', function (req, res) {
  res.redirect('/')
})

app.all('/generate_204', function (req, res) {
  res.redirect('/')
})

//
// Set up logging
//

const loggerFormat = ':date[web] - :status - :method - :url :' +
  ' \n\t Remote Adress: :remote-addr \n\t Request Header: :req[header]' +
  ' \n\t Response Header: :res[header] \n\t ResponseTime: :response-time ms'

// create a rotating write stream
const accessLogStream = rotatingFileStream.createStream('express.log', {
  size: '10000000B', // rotate every 10 MegaBytes written
  interval: '1d', // rotate daily
  maxFiles: 1,
  path: 'logs'
})

app.use(morganLogger(loggerFormat, {
  stream: accessLogStream
}))

//
//
//

mongoose.Promise = bluebird

async function connectDB (host = 'localhost', port = 27017, dbName) {

  dbName = config['db-name']
  const dbUser = config['db-user']
  const dbPassword = config['db-password']

  let uri

  if (options['db-uri']) {
    uri = options['db-uri']

  } else if (process.env.DB_URI) {
    uri = process.env.DB_URI

  } else if (dbUser === null && dbPassword === null) {
    uri = `mongodb://${host}:${port}/${dbName}`

  } else if (dbUser !== null && dbPassword !== null) {
    uri = `mongodb://${dbUser}:${dbPassword}@${host}:${port}/${dbName}`

  } else {
    console.error('Error in config.json. Must provide both user and password, or neither.')
    process.exit()
  }

  migrate_db.uri = uri
  console.log(`Connect to MongoDB ${uri}`)
  return mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true})
}

app.use(express.json())
app.use(express.static(path.join(__dirname, 'dist/wAVdio')))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))
app.use('*', express.static(path.join(__dirname, 'dist/wAVdio')))

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
app.use(function (err, req, res) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.sendStatus(err.status)
})

//
// Event listener for HTTP server "error" event
//

function onError (error) {
  if (error.syscall !== 'listen') {
    throw error
  }

  const bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges')
      process.exit(1)
      break
    case 'EADDRINUSE':
      console.error(bind + ' is already in use')
      process.exit(1)
      break
    default:
      throw error
  }
}

//
// Event listener for HTTP server "listening" event
//

const server = http.createServer(app)

const debug = require('debug')('wAVdio:server')

function onListening () {
  const addr = server.address()
  const bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port
  debug('wAVdio is listening on ' + bind)
}

server.on('error', onError)
server.on('listening', onListening)

//
// Export functions to start and stop the server
//

function listen (server, settings) {
  server.listen(settings.server.port)

  console.log(`Listening on port ${settings.server.port}`)
}

const listen2 = async function (settings = settingsDefault) {
  try {
    await connectDB(settings.db.host, settings.db.port, settings.db.name)
    console.log('MongoDB connection established')

    migrate.load({
      stateStore: '.migrate',
      migrationsDirectory: path.resolve(__dirname, 'migrations/')
    }, function (err, set) {
      if (err) {
        throw err
      }
      set.up(function (err) {
        if (err) {
          throw err
        }
        console.log('migrations successfully ran')

        listen(server, settings)
      })
    })

  } catch (err) {
    console.error(err)
  }
}

listen2()
