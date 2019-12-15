const mongoose = require('mongoose');

const Image = require('./image');
const View = require('./view');
const Like = require('./like');
const Comment = require('./comment');
const ExpositionContent = require('./exposition-content');

const Schema = mongoose.Schema;

module.exports = new Schema({
  museum: {type: mongoose.Schema.Types.ObjectId, ref: 'Museum', required: true},

  active: {type: Boolean, required: true},
  code: {type: Number, required: true},
  note: {type: String, required: false},

  logo: {type: Image, required: false},

  views: [View],
  likes: [Like],
  comments: [Comment],

  contents: [ExpositionContent]
}, {
  strict: 'throw'
});
