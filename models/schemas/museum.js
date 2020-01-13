const mongoose = require('mongoose');

const MuseumContent = require('./museum-content');

const Schema = mongoose.Schema;

module.exports = new Schema({
  contents: [MuseumContent]
}, {
  strict: 'throw'
});
