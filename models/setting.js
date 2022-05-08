const { model } = require('mongoose')

const { settingSchema } = require('./schemas/setting')

const Setting = model('Setting', settingSchema)

module.exports = { Setting }
