const mongoose = require('mongoose')

const View = require('./view')
const Like = require('./like')
const Comment = require('./comment')
const ExhibitContent = require('./exhibit-content')

const Schema = mongoose.Schema

module.exports = new Schema({
  parent: {type: Schema.Types.ObjectId, refPath: 'parentModel', required: true},
  parentModel: {type: String, enum: ['Museum', 'Exposition'], required: true},

  active: {type: Boolean, required: true},
  code: {type: Number, required: true},
  note: {type: String, required: false},

  views: [View],
  likes: [Like],
  comments: [Comment],

  contents: [ExhibitContent]
}, {
  strict: 'throw'
})
