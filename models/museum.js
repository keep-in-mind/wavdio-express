const { model } = require('mongoose')

const { museumSchema } = require('./schemas/museum')

const Museum = model('Museum', museumSchema)

module.exports = { Museum }
