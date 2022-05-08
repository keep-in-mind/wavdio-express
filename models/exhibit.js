const { model } = require('mongoose')

const { exhibitSchema } = require('./schemas/exhibit')

const Exhibit = model('Exhibit', exhibitSchema)

module.exports = { Exhibit }
