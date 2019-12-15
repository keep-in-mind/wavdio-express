const mongoose = require('mongoose');

const Schema = mongoose.Schema;

module.exports = new Schema({
  filename: {type: String, required: true},
  mimeType: {type: String, required: true}
}, {
  strict: 'throw'
});
