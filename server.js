const express = require('express')
const morgan = require('morgan')
const path = require('path')
const rotatingFileStream = require('rotating-file-stream')

const { router: exhibitRouter } = require('./routes/exhibit')
const { router: expositionRouter } = require('./routes/exposition')
const { router: infopageRouter } = require('./routes/infopage')
const { router: loggingRouter } = require('./routes/logging')
const { router: museumRouter } = require('./routes/museum')
const { router: settingRouter } = require('./routes/setting')
const { router: uploadRouter } = require('./routes/upload')
const { router: userRouter } = require('./routes/user')

const server = express()

server.use(express.urlencoded({ extended: true }))
server.use(express.json())

server.use('/api/v2', exhibitRouter)
server.use('/api/v2', expositionRouter)
server.use('/api/v2', infopageRouter)
server.use('/api/v2', loggingRouter)
server.use('/api/v2', museumRouter)
server.use('/api/v2', settingRouter)
server.use('/api/v2', userRouter)
server.use('/upload', uploadRouter)

server.use('/uploads', express.static(path.join(__dirname, 'uploads')))

server.get('/', (_request, response) =>
  response.status(200).send('Serving wavdio-express 3.1.3'))

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

server.use(morgan(format, { stream }))

module.exports = { server }
