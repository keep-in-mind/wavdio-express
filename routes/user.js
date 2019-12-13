const express = require('express');
const router = express.Router();
let jwt = require('express-jwt');

const auth = jwt({
  secret: 'MY_SECRET',
  userProperty: 'payload'
});

const User = require('../models/user');

const crtlAuth = require('../controllers/authentification');

router.route('/login').post(crtlAuth.login);

router.route('/register').post(crtlAuth.register);

router.route('/update').post(crtlAuth.update);

module.exports = router;
