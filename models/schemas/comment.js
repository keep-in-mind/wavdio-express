const mongoose = require('mongoose');

const Schema = mongoose.Schema;

module.exports = new Schema({
  text: {type: String, required: true},
  timestamp: {type: Date, required: true}
}, {
  strict: 'throw'
});
