const mongoose = require('mongoose');

const Image = require('./image');
const MuseumContent = require('./museum-content');

const Schema = mongoose.Schema;

module.exports = new Schema({
  contents: [MuseumContent]
}, {
  strict: 'throw'
});
