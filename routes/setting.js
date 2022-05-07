const express = require('express')

const logger = require('../logging')

const { Setting } = require('../models/setting')
const { User } = require('../models/user')

const router = express.Router()

router.route('/setting').get(async (request, response) => {
  try {

    Setting.find((error, settings) => {
      if (error) {
        logger.error(error)
        response.status(500).send(error)
      } else {
        response.status(200).json(settings)
      }
    })

  } catch (error) {
    logger.error(error)

    return response.status(500).send(error)
  }
})

router.route('/setting').post(async (request, response) => {
  try {

    User.findOne({}, function (err, user_) {
      if (user_.session_id !== request.headers.authorization) {
        return response.status(401).json({ 'message': 'unauthorized' })
      } else {
        Setting.create(request.body, (error, setting) => {
          if (error && error.name === 'ValidationError') {
            response.status(400).json({ 'message': error.message })
          } else if (error) {
            logger.log(error)
            response.status(500).send(error)
          } else {
            response.status(201).json(setting)
          }
        })
      }
    })

  } catch (error) {
    logger.error(error)

    return response.status(500).send(error)
  }
})

router.route('/setting/:setting_id').get(async (request, response) => {
  try {

    Setting.findById(request.params.setting_id, (error, setting) => {
      if (error) {
        logger.error(error)
        response.status(500).send(error)
      } else if (setting) {
        response.status(200).json(setting)
      } else {
        response.status(404).send()
      }
    })

  } catch (error) {
    logger.error(error)

    return response.status(500).send(error)
  }
})

router.route('/setting/:setting_id').put(async (request, response) => {
  try {

    User.findOne({}, function (err, user_) {
      if (user_.session_id !== request.headers.authorization) {
        return response.status(401).json({ 'message': 'unauthorized' })
      } else {
        const body = request.body
        delete body._id
        Setting.findOneAndUpdate({ _id: request.params.setting_id }, body, (error, setting) => {
          if (error && error.name === 'ValidationError') {
            response.status(400).json({ 'message': error.message })
          } else if (error) {
            logger.log(error)
            response.status(500).send(error)
          } else if (setting) {
            response.status(200).json(setting)
          } else {
            response.status(404).send()
          }
        })
      }
    })

  } catch (error) {
    logger.error(error)

    return response.status(500).send(error)
  }
})

router.route('/setting/:setting_id').patch(async (request, response) => {
  try {

    User.findOne({}, function (err, user_) {
      if (user_.session_id !== request.headers.authorization) {
        return response.status(401).json({ 'message': 'unauthorized' })

      } else {
        const body = request.body
        delete body._id
        Setting.updateOne({ _id: request.params.setting_id }, body, (error, setting) => {
          if (error && error.name === 'ValidationError') {
            response.status(400).json({ 'message': error.message })
          } else if (error) {
            logger.log(error)
            response.status(500).send(error)
          } else {
            response.status(200).json(setting)
          }
        })
      }
    })

  } catch (error) {
    logger.error(error)

    return response.status(500).send(error)
  }
})

router.route('/setting/:setting_id').delete(async (request, response) => {
  try {

    User.findOne({}, function (err, user_) {
      if (user_.session_id !== request.headers.authorization) {
        return response.status(401).json({ 'message': 'unauthorized' })
      } else {
        Setting.findOneAndRemove({ _id: request.params.setting_id }, (error, setting) => {
          if (error) {
            logger.log(error)
            response.status(500).send(error)
          } else if (setting) {
            response.status(200).json(setting)
          } else {
            response.status(404).send()
          }
        })
      }
    })

  } catch (error) {
    logger.error(error)

    return response.status(500).send(error)
  }
})

module.exports = router
