const { Schema } = require('mongoose')

const expositionContentSchema = new Schema({
  lang: { type: String, required: true },

  name: { type: String, required: false },
  info: { type: String, required: false }
}, {
  strict: 'throw'
})

module.exports = { expositionContentSchema }
