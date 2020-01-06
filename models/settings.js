const mongoose = require('mongoose');

const Settings = require('./schemas/settings');

module.exports = mongoose.model('Settings', Settings);
