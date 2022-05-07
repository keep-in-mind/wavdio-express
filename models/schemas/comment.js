const { Schema } = require('mongoose')

const commentSchema = new Schema({
  text: { type: String, required: true },
  timestamp: { type: Date, required: true }
}, {
  strict: 'throw'
})

module.exports = { commentSchema }
