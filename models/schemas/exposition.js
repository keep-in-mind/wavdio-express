const { Schema } = require('mongoose')

const { commentSchema } = require('./comment')
const { expositionContentSchema } = require('./exposition-content')
const { imageSchema } = require('./image')
const { likeSchema } = require('./like')
const { viewSchema } = require('./view')

const expositionSchema = new Schema({
  museum: { type: Schema.Types.ObjectId, ref: 'Museum', required: true },

  active: { type: Boolean, required: true },
  code: { type: Number, required: true },
  note: { type: String, required: false },

  logo: { type: imageSchema, required: false },

  views: [viewSchema],
  likes: [likeSchema],
  comments: [commentSchema],

  contents: [expositionContentSchema]
}, {
  strict: 'throw'
})

module.exports = { expositionSchema }
