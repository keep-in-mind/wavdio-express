const express = require('express')

const { Setting } = require('../models/setting')
const { User } = require('../models/user')
const { logger } = require('../logging')

const router = express.Router()

router.route('/setting').get(async (_request, response) => {
  try {
    const settings = await Setting.find()

    return response.status(200).json(settings)

  } catch (error) {
    logger.error(error)

    return response.status(500).send(error)
  }
})

router.route('/setting').post(async (request, response) => {
  try {
    const authorization = request.headers.authorization
    const settingPost = request.body

    /// Check authorization

    const user = await User.findOne()

    if (user.session_id !== authorization) {
      return response.status(401).json({ 'message': 'unauthorized' })
    }

    /// Create setting

    const createdSetting = await Setting.create(settingPost)

    return response.status(201).json(createdSetting)

  } catch (error) {
    logger.error(error)

    if (error.name === 'ValidationError') {
      return response.status(400).json({ 'message': error.message })
    }

    return response.status(500).send(error)
  }
})

router.route('/setting/:settingId').get(async (request, response) => {
  try {
    const settingId = request.params.settingId

    /// Check if setting exists and return it

    const setting = await Setting.findById(settingId)

    if (!setting) {
      return response.status(404).send()
    }

    return response.status(200).json(setting)

  } catch (error) {
    logger.error(error)

    return response.status(500).send(error)
  }
})

router.route('/setting/:settingId').put(async (request, response) => {
  try {
    const settingId = request.params.settingId
    const authorization = request.headers.authorization
    const settingPut = request.body

    /// Check authorization

    const user = await User.findOne()

    if (user.session_id !== authorization) {
      return response.status(401).json({ 'message': 'unauthorized' })
    }

    /// Try to update setting an return it

    delete settingPut._id

    const updatedSetting = await Setting.findOneAndUpdate({ _id: settingId }, settingPut)

    if (!updatedSetting) {
      return response.status(404).send()
    }

    return response.status(200).json(updatedSetting)

  } catch (error) {
    logger.error(error)

    return response.status(500).send(error)
  }
})

router.route('/setting/:settingId').patch(async (request, response) => {
  try {
    const settingId = request.params.settingId
    const authorization = request.headers.authorization
    const settingPatch = request.body

    /// Check authorization

    const user = await User.findOne()

    if (user.session_id !== authorization) {
      return response.status(401).json({ 'message': 'unauthorized' })
    }

    /// Update and return setting

    delete settingPatch._id

    const updatedSetting = await Setting.findOneAndUpdate({ _id: settingId }, settingPatch)

    return response.status(200).json(updatedSetting)

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

    const user = await User.findOne()

    if (user.session_id !== authorization) {
      return response.status(401).json({ 'message': 'unauthorized' })
    }

    /// Remove setting from database

    const setting = await Setting.findByIdAndRemove(settingId)

    if (!setting) {
      return response.status(404).send()
    }

    return response.status(200).json(setting)

  } catch (error) {
    logger.error(error)

    return response.status(500).send(error)
  }
})

module.exports = { router }
