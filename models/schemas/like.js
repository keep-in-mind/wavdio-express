const { Schema } = require('mongoose')

const likeSchema = new Schema({
  timestamp: { type: Date, required: true }
}, {
  strict: 'throw'
})

module.exports = { likeSchema }
