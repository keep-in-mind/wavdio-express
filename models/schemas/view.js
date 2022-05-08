const { Schema } = require('mongoose')

const viewSchema = new Schema({
  timestamp: { type: Date, required: true }
}, {
  strict: 'throw'
})

module.exports = { viewSchema }
