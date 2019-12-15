const mongoose = require('mongoose');

const Museum = require('./schemas/museum');

module.exports = mongoose.model('Museum', Museum);
