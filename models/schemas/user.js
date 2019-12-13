const mongoose = require('mongoose');

const Schema = mongoose.Schema;

module.exports = new Schema({
  username: {type: String, required: true},
  password: {type: String, required: true} // hash value
}, {
  strict: 'throw'
});
