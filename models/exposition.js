const mongoose = require('mongoose');

const Exposition = require('./schemas/exposition');

module.exports = mongoose.model('Exposition', Exposition);
