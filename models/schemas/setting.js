const { Schema } = require('mongoose')

const settingSchema = new Schema({
  activeLangs: {
    type: {
      de: { type: Boolean, required: true },
      en: { type: Boolean, required: true },
      es: { type: Boolean, required: true },
      fr: { type: Boolean, required: true }
    },
    required: true
  }
}, {
  strict: 'throw'
})

module.exports = { settingSchema }
