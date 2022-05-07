const { Schema } = require('mongoose')

const imageSchema = new Schema({
  filename: { type: String, required: true },
  alternativeText: { type: String, required: false }
}, {
  strict: 'throw'
})

module.exports = { imageSchema }
