const mongoose = require('mongoose');

const Infopage = require('./schemas/infopage');

module.exports = mongoose.model('Infopage', Infopage);
