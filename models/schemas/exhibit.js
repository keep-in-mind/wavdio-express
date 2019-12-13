const mongoose = require('mongoose');

const View = require('./view');
const Like = require('./like');
const Comment = require('./comment');
const ExhibitContent = require('./exhibit-content');

const Schema = mongoose.Schema;

module.exports = new Schema({
  exposition: {type: Schema.Types.ObjectId, ref: 'Exposition', required: true},

  active: {type: Boolean, required: true},
  code: {type: Number, required: true},
  note: {type: String, required: false},

  views: [View],
  likes: [Like],
  comments: [Comment],

  contents: [ExhibitContent]
}, {
  strict: 'throw'
});
