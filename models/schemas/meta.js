const { Schema } = require('mongoose')

const metaSchema = new Schema({
  version: {
    type: Number,
    required: true
  }
}, {
  strict: 'throw'
})

module.exports = { metaSchema }
