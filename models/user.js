const mongoose = require('mongoose');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const Schema = mongoose.Schema;

const schema = new Schema({
  username: { type: String },
  hash: { type: String }, // hash value
  salt: { type: String },
  session_id: { type: String },
  session_timeout: { type: Date }
});

schema.methods.setPassword = function (password) {
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
};

schema.methods.validPassword = function (userna, passw) {
  const hash = crypto.pbkdf2Sync(passw, this.salt, 1000, 64, 'sha512').toString('hex');
  return this.hash === hash && this.username === userna;
};

schema.methods.setSession = function () {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 1);

  this.session_id = crypto.randomBytes(512).toString('hex') + "";
  this.session_timeout = expiry;

  console.log(this.session_timeout, expiry)

};

schema.methods.generateJwt = function () {
  return jwt.sign({
    session_id: this.session_id,
    session_timeout: this.session_timeout,
  }, "MY_SECRET"); // DO NOT KEEP YOUR SECRET IN THE CODE!
};

module.exports = mongoose.model('User', schema);

mongoose.model('User', schema);
