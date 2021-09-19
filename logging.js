const {createLogger, format, transports} = require('winston')
const {combine, timestamp, printf} = format

const myFormat = printf(({level, message, timestamp}) => {
  return `${timestamp}  -  [${level}]: ${message}`
})

const console_transport = new (transports.Console)({
  // because of the debug level for logging, everything thats less in priority than debug will also be logged to file
  level: 'debug',
  timestamp: true,
  datePattern: 'YYYY-MM-DD-HH',
  handleExceptions: true,
  json: false,
  colorize: true,
})

const file_transport = new (transports.File)({
  filename: 'logs/application.log',
  datePattern: 'YYYY-MM-DD-HH',
  json: true,
  timestamp: true,
  zippedArchive: false,
  maxSize: '10m',
  maxFiles: '1'
})

const logger = createLogger({
  format: combine(
    timestamp(),
    myFormat
  ),
  transports: [
    file_transport,
    console_transport
  ],
  exitOnError: false, // do not exit on handled exceptions
})

module.exports = logger
