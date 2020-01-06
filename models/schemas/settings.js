const mongoose = require('mongoose');

const Schema = mongoose.Schema;

module.exports = new Schema({
  activeLangs: {
    type: {
      de: {type: Boolean, required: true},
      en: {type: Boolean, required: true},
      fr: {type: Boolean, required: true}
    },
    required: true
  }
}, {
  strict: 'throw'
});
