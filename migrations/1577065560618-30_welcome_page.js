const mongoose = require('mongoose')

const Museum = require('../models/museum')

module.exports.up = async function () {
  console.log('Upgrading to 30_welcome_page')

  mongoose.connect('mongodb://localhost:27017/wAVdioDB')
  const museums = await Museum.find()
  console.log(museums)
}

module.exports.down = async function (next) {
  console.log('Downgrading from 30_welcome_page')
}
