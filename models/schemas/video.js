const { Schema } = require('mongoose')

const videoSchema = new Schema({
  filename: { type: String, required: true },
  mimeType: { type: String, required: true },
  transcript: { type: String, required: false }
}, {
  strict: 'throw'
})

module.exports = { videoSchema }
