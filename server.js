#!/usr/bin/env node

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

const exhibitRouter = require('./routes/exhibit')
const expositionRouter = require('./routes/exposition')
const infopageRouter = require('./routes/infopage')
const loggingRouter = require('./routes/logging')
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

app.use(express.static(path.join(__dirname, 'dist/wAVdio')))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))
app.use('*', express.static(path.join(__dirname, 'dist/wAVdio')))

app.get('/', (req, res) =>
  res.status(200).send('Server is up'))

//
// Command Line Args
//

const options = commandLineArgs([
  {name: 'db-uri', type: String},
  {name: 'help', type: Boolean},
  {name: 'port', type: Number}
])

if (options['help']) {
  const sections = [{
    header: 'Options',
    optionList: [
      {
        name: 'db-uri',
        typeLabel: '{underline string}',
        description: 'MongoDB URI'
      },
      {
        name: 'help',
        typeLabel: ' ',
        description: 'Print this usage guide'
      },
      {
        name: 'port',
        typeLabel: '{underline number}',
        description: 'Express port (default: 3000)'
      }
    ]
  }]

  const usage = commandLineUsage(sections)
  console.log(usage)

  process.exit()
}

const config = {
  dbUri: options['db-uri'] || process.env.DB_URI || 'mongodb://localhost:27017/wavdio-express',
  port: options['port'] || process.env.PORT || 3000
}

// Make DB URI accessible in migrations
process.env.DB_URI = config.dbUri

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

main()
  .then()
  .catch(error => console.error(error))

async function main() {
  console.log(`Connect to MongoDB at ${config.dbUri}`)
  await mongoose.connect(config.dbUri)

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

      console.log('Migrations ran successfully')

      const server = http.createServer(app)

      server.listen(config.port)

      console.log(`Listening on port ${config.port}`)
    })
  })
}
