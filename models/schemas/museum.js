const { Schema } = require('mongoose')

const { museumContentSchema } = require('./museum-content')

const museumSchema = new Schema({
  contents: [museumContentSchema]
}, {
  strict: 'throw'
})

module.exports = { museumSchema }
