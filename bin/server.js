#!/usr/bin/env node

const migrate = require('migrate')

const app = require('../app');

migrate.load({
  stateStore: '.migrate'
}, function (err, set) {
  if (err) {
    throw err
  }
  set.up(function (err) {
    if (err) {
      throw err
    }
    console.log('migrations successfully ran')

    app.listen();
  })
})

module.exports = app.server;
