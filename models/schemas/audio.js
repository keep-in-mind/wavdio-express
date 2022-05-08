const { Schema } = require('mongoose')

const audioSchema = new Schema({
  filename: { type: String, required: true },
  mimeType: { type: String, required: true }
}, {
  strict: 'throw'
})

module.exports = { audioSchema }
