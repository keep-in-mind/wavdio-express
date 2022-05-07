const express = require('express')

const crtlAuth = require('../controllers/authentification')

const router = express.Router()

router.route('/login').post(crtlAuth.login)

router.route('/register').post(crtlAuth.register)

router.route('/update').post(crtlAuth.update)

module.exports = router
