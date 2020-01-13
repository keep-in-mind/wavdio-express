const mongoose = require('mongoose');

const Setting = require('./schemas/setting');

module.exports = mongoose.model('Setting', Setting);
