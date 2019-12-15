const mongoose = require('mongoose');

const Schema = mongoose.Schema;

module.exports = new Schema({
  filename: {type: String, required: true},
  text: {type: String, required: false}
}, {
  strict: 'throw'
});