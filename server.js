#!/usr/bin/env node

const express = require('express')
const migrate = require('migrate')
const mongoose = require('mongoose')
const morgan = require('morgan')
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

module.exports.createServer = (config) => new Promise((resolve, reject) => {

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

  app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

  app.get('/', (req, res) =>
    res.status(200).send('Server is up'))

  //
  // Set up logging
  //

  const format = ':date[web] - :status - :method - :url :' + '\n' +
    '\t' + 'Remote Address: :remote-addr' + '\n' +
    '\t' + 'Request Header: :req[header]' + '\n' +
    '\t' + 'Response Header: :res[header]' + '\n' +
    '\t' + 'ResponseTime: :response-time ms'

  const stream = rotatingFileStream.createStream('express.log', {
    size: '10M',
    interval: '1d',
    maxFiles: 1,
    path: 'logs'
  })

  app.use(morgan(format, {stream}))

  //
  // Run migrations
  //

  // Make DB URI accessible in migrations
  process.env.DB_URI = config.dbUri

  migrate.load({
    stateStore: '.migrate',
    migrationsDirectory: path.resolve(__dirname, 'migrations/')
  }, function (err, set) {
    if (err) {
      reject(err)
    }

    set.up(function (err) {
      if (err) {
        reject(err)
      }

      console.log('Migrations ran successfully')

      console.log(`Connect to MongoDB at ${config.dbUri}`)
      mongoose.connect(config.dbUri, () => {
        console.log('Connected to MongoDB')

        //
        // Return server
        //

        resolve(app)
      })
    })
  })
})
