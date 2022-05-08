const { Schema } = require('mongoose')

const userSchema = new Schema({
  username: { type: String, required: true },
  password: { type: String, required: true } // hash value
}, {
  strict: 'throw'
})

module.exports = { userSchema }
