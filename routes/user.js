const express = require('express')

const { User } = require('../models/user')
const { logger } = require('../logging')

const router = express.Router()

router.route('/login').post(async (request, response) => {
    try {
        const userCredentialsPost = request.body

        const user = await User.findOne()

        if (!user.validPassword(userCredentialsPost.username, userCredentialsPost.password)) {
            return response.status(401).json({ 'message': 'Wrong crendentails' })
        }

        user.setSession()
        user.save()

        return response.status(200).json({ 'token': user.generateJwt() })

    } catch (error) {
        logger.error(error)

        return response.status(500).send(error)
    }
})

router.route('/register').post((request, response) => {
    try {
        const userRegistrationPost = request.body

        const user = new User()
        user.username = userRegistrationPost.username
        user.setPassword(userRegistrationPost.password)
        user.setSession()

        user.save(() => {
            response.status(200).json({ 'token': user.generateJwt() })
        })

    } catch (error) {
        logger.error(error)

        return response.status(500).send(error)
    }
})

router.route('/update').post(async (request, response) => {
    try {
        const userUpdatePost = request.body

        const user = await User.findOne()

        if (!user.validPassword(userUpdatePost.username, userUpdatePost.password)) {
            return response.status(404).json({ 'message': 'Wrong Data' })
        }

        user.username = userUpdatePost.newUsername
        user.setPassword(userUpdatePost.newPassword)
        user.setSession()

        user.save(function () {
            return response.status(200).json({ 'token': user.generateJwt() })
        })

    } catch (error) {
        logger.error(error)

        return response.status(500).send(error)
    }
})

module.exports = { router }
