#!/usr/bin/env node

const commandLineArgs = require('command-line-args')
const commandLineUsage = require('command-line-usage')

const server = require('../server')

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

server.createServer(config)
  .then((app) => {
    app.listen(config.port)
    console.log(`Listening on port ${config.port}`)
  })
  .catch(error => console.error(error))
