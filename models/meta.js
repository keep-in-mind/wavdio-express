const { model } = require('mongoose')

const { metaSchema } = require('./schemas/meta')

const Meta = model('Meta', metaSchema)

module.exports = { Meta }
