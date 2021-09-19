const mongoose = require('mongoose')

const Schema = mongoose.Schema

module.exports = new Schema({
  timestamp: {type: Date, required: true}
}, {
  strict: 'throw'
})
