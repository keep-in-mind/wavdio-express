const mongoose = require('mongoose');

const Image = require('./image');
const Audio = require('./audio');
const Video = require('./video');
const Transcript = require('./transcript');

const Schema = mongoose.Schema;

module.exports = new Schema({
  lang: {type: String, required: true},

  name: {type: String, required: true},
  info: {type: String, required: false},
  transcript: {type: Transcript, required: false},

  images: [Image],
  audio: [Audio],
  video: [Video],
}, {
  strict: 'throw'
});
