const mongoose = require('mongoose');

const Schema = mongoose.Schema;

module.exports = new Schema({
  lang: {type: String, required: true},

  name: {type: String, required: true},
  text: {type: String, required: false}
}, {
  strict: 'throw'
});
