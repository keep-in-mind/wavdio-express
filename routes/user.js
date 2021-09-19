const express = require('express')
const router = express.Router()
let expressJwt = require('express-jwt')

const auth = expressJwt({
  algorithms: ['RS256'],
  secret: 'MY_SECRET',
  userProperty: 'payload'
})

const User = require('../models/user')

const crtlAuth = require('../controllers/authentification')

router.route('/login').post(crtlAuth.login)

router.route('/register').post(crtlAuth.register)

router.route('/update').post(crtlAuth.update)

module.exports = router
