const mongoose = require('mongoose');

const Image = require('./image');

const Schema = mongoose.Schema;

module.exports = new Schema({
  lang: {type: String, required: true},

  name: {type: String, required: true},
  welcomeText: {type: String, required: false},
  termsOfUse: {type: String, required: false},
  privacyTerms: {type: String, required: false},

  sitePlan: {type: Image, required: false}
}, {
  strict: 'throw'
});
