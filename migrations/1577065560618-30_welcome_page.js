'use strict'

module.exports.up = function (next) {
  console.log('Upgrading to 30_welcome_page')

  next()
}

module.exports.down = function (next) {
  console.log('Downgrading from 30_welcome_page')

  next()
}
