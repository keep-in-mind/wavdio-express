const mongoose = require('mongoose')

const Image = require('./image')

const Schema = mongoose.Schema

module.exports = new Schema({
  lang: {type: String, required: true},

  name: {type: String, required: false},
  info: {type: String, required: false},
  welcomeText: {type: String, required: false},
  termsOfUse: {type: String, required: false},
  privacyTerms: {type: String, required: false},
  imprint: {type: String, required: false},

  logo: {type: Image, required: false},
  image: {type: Image, required: false},
  sitePlan: {type: Image, required: false},
  sitePlanText: {type: String, required: false}
}, {
  strict: 'throw'
})
