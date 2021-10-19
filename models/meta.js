const mongoose = require('mongoose')

const Meta = require('./schemas/meta')

module.exports = mongoose.model('Meta', Meta)
