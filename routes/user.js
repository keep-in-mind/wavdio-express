const express = require('express')
const router = express.Router()

const crtlAuth = require('../controllers/authentification')

router.route('/login').post(crtlAuth.login)

router.route('/register').post(crtlAuth.register)

router.route('/update').post(crtlAuth.update)

module.exports = router
