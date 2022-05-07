const express = require('express')

const User = require('../models/user')

const logger = require('../logging')

const router = express.Router()

router.route('/login').post(function (request, response) {
    try {
        const body = request.body

        User.findOne({}, function (err, _user) {
            if (err) return response.status(404).json(err)
            if (!_user.validPassword(body.username, body.password)) {
                response.status(401).json({ 'message': 'Wrong crendentails' })
            } else {
                _user.setSession()
                _user.save()
                response.status(200)
                response.json({
                    'token': _user.generateJwt()
                })
            }
        })

    } catch (error) {
        logger.error(error)

        return response.status(500).send(error)
    }
})

router.route('/register').post(function (request, response) {
    try {
        const body = request.body

        const user = new User()

        user.username = body.username

        user.setPassword(body.password)

        user.setSession()

        user.save(function () {
            response.status(200)
            response.json({
                'token': user.generateJwt()
            })
        })

    } catch (error) {
        logger.error(error)

        return response.status(500).send(error)
    }
})

router.route('/update').post(function (request, response) {
    try {
        const body = request.body

        User.findOne({}, function (err, user) {
            if (err) return response.status(404).json(err)
            if (user.validPassword(body.username, body.password)) {
                user.username = body.newUsername
                user.setPassword(body.newPassword)
                user.setSession()
            } else {
                response.status(404).json({ 'message': 'Wrong Data' })
            }
            user.save(function () {
                response.status(200)
                response.json({
                    'token': user.generateJwt()
                })
            })
        })

    } catch (error) {
        logger.error(error)

        return response.status(500).send(error)
    }
})

module.exports = router
