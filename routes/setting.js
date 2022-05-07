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
    const authorization = request.headers.authorization
    const body = request.body

    /// Check authorization

    const user = await User.findOne({})

    if (user.session_id !== authorization) {
      return response.status(401).json({ 'message': 'unauthorized' })
    }

    Setting.create(body, (error, setting) => {
      if (error && error.name === 'ValidationError') {
        response.status(400).json({ 'message': error.message })
      } else if (error) {
        logger.log(error)
        response.status(500).send(error)
      } else {
        response.status(201).json(setting)
      }
    })

  } catch (error) {
    logger.error(error)

    return response.status(500).send(error)
  }
})

router.route('/setting/:settingId').get(async (request, response) => {
  try {
    const settingId = request.params.settingId

    Setting.findById(settingId, (error, setting) => {
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

router.route('/setting/:settingId').put(async (request, response) => {
  try {
    const settingId = request.params.settingId
    const authorization = request.headers.authorization
    const body = request.body

    /// Check authorization

    const user = await User.findOne({})

    if (user.session_id !== authorization) {
      return response.status(401).json({ 'message': 'unauthorized' })
    }

    delete body._id
    Setting.findOneAndUpdate({ _id: settingId }, body, (error, setting) => {
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

  } catch (error) {
    logger.error(error)

    return response.status(500).send(error)
  }
})

router.route('/setting/:settingId').patch(async (request, response) => {
  try {
    const settingId = request.params.settingId
    const authorization = request.headers.authorization
    const body = request.body

    /// Check authorization

    const user = await User.findOne({})

    if (user.session_id !== authorization) {
      return response.status(401).json({ 'message': 'unauthorized' })
    }

    delete body._id
    Setting.updateOne({ _id: settingId }, body, (error, setting) => {
      if (error && error.name === 'ValidationError') {
        response.status(400).json({ 'message': error.message })
      } else if (error) {
        logger.log(error)
        response.status(500).send(error)
      } else {
        response.status(200).json(setting)
      }
    })

  } catch (error) {
    logger.error(error)

    return response.status(500).send(error)
  }
})

router.route('/setting/:settingId').delete(async (request, response) => {
  try {
    const settingId = request.params.settingId
    const authorization = request.headers.authorization

    /// Check authorization

    const user = await User.findOne({})

    if (user.session_id !== authorization) {
      return response.status(401).json({ 'message': 'unauthorized' })
    }

    Setting.findOneAndRemove({ _id: settingId }, (error, setting) => {
      if (error) {
        logger.log(error)
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

module.exports = router
