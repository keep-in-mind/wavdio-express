const { model } = require('mongoose')

const { expositionSchema } = require('./schemas/exposition')

const Exposition = model('Exposition', expositionSchema)

module.exports = { Exposition }
