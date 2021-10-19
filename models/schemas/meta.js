const mongoose = require('mongoose')

const Schema = mongoose.Schema

module.exports = new Schema({
  version: {
    type: Number,
    required: true
  }
}, {
  strict: 'throw'
})
