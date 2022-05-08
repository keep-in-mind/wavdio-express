const { Schema } = require('mongoose')

const transcriptSchema = new Schema({
  filename: { type: String, required: true },
  text: { type: String, required: false }
}, {
  strict: 'throw'
})

module.exports = { transcriptSchema }
