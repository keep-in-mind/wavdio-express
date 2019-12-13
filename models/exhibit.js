const mongoose = require('mongoose');

const Exhibit = require('./schemas/exhibit');

module.exports = mongoose.model('Exhibit', Exhibit);
