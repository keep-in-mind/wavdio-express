const mongoose = require('mongoose');

const Schema = mongoose.Schema;

module.exports = new Schema({
  lang: {type: String, required: true},

  name: {type: String, required: false},
  info: {type: String, required: false}
}, {
  strict: 'throw'
});
