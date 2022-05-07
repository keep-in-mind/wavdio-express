const { Schema } = require('mongoose')

const { audioSchema } = require('./audio')
const { imageSchema } = require('./image')
const { transcriptSchema } = require('./transcript')
const { videoSchema } = require('./video')

const exhibitContentSchema = new Schema({
  lang: { type: String, required: true },

  name: { type: String, required: false },
  info: { type: String, required: false },
  transcript: { type: transcriptSchema, required: false },

  images: [imageSchema],
  audio: [audioSchema],
  video: [videoSchema],
}, {
  strict: 'throw'
})

module.exports = { exhibitContentSchema }
