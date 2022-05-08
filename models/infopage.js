const { model } = require('mongoose')

const { infopageSchema } = require('./schemas/infopage')

const Infopage = model('Infopage', infopageSchema)

module.exports = { Infopage }
