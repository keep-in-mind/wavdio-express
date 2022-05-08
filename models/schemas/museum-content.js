const { Schema } = require('mongoose')

const { imageSchema } = require('./image')

const museumContentSchema = new Schema({
  lang: { type: String, required: true },

  name: { type: String, required: false },
  info: { type: String, required: false },
  welcomeText: { type: String, required: false },
  termsOfUse: { type: String, required: false },
  privacyTerms: { type: String, required: false },
  imprint: { type: String, required: false },

  logo: { type: imageSchema, required: false },
  image: { type: imageSchema, required: false },
  sitePlan: { type: imageSchema, required: false },
  sitePlanText: { type: String, required: false }
}, {
  strict: 'throw'
})

module.exports = { museumContentSchema }
