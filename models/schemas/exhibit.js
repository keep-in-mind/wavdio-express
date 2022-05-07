const { Schema } = require('mongoose')

const { commentSchema } = require('./comment')
const { exhibitContentSchema } = require('./exhibit-content')
const { likeSchema } = require('./like')
const { viewSchema } = require('./view')

const exhibitSchema = new Schema({
  parent: { type: Schema.Types.ObjectId, refPath: 'parentModel', required: true },
  parentModel: { type: String, enum: ['Museum', 'Exposition'], required: true },

  active: { type: Boolean, required: true },
  code: { type: Number, required: true },
  note: { type: String, required: false },

  views: [viewSchema],
  likes: [likeSchema],
  comments: [commentSchema],

  contents: [exhibitContentSchema]
}, {
  strict: 'throw'
})

module.exports = { exhibitSchema }
