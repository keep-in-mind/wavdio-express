const { Schema } = require('mongoose')

const infopageSchema = new Schema({
  lang: { type: String, required: true },

  name: { type: String, required: true },
  text: { type: String, required: false }
}, {
  strict: 'throw'
})

module.exports = { infopageSchema }
