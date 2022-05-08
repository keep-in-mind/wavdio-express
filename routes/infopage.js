const express = require('express')

const logger = require('../logging')

const { Infopage } = require('../models/infopage')
const { User } = require('../models/user')

const router = express.Router()

router.route('/infopage').get(async (_request, response) => {
  try {
    const infopages = await Infopage.find()

    return response.status(200).json(infopages)

  } catch (error) {
    logger.error(error)

    return response.status(500).send(error)
  }
})

router.route('/infopage').post(async (request, response) => {
  try {
    const authorization = request.headers.authorization
    const infopagePost = request.body

    /// Check authorization

    const user = await User.findOne()

    if (user.session_id !== authorization) {
      return response.status(401).json({ 'message': 'unauthorized' })
    }

    /// Create infopage

    const createdInfopage = await Infopage.create(infopagePost)

    return response.status(201).json(createdInfopage)

  } catch (error) {
    logger.error(error)

    if (error.name === 'ValidationError') {
      return response.status(400).json({ 'message': error.message })
    }

    return response.status(500).send(error)
  }
})

router.route('/infopage/:infopageId').get(async (request, response) => {
  try {
    const infopageId = request.params.infopageId

    /// Check if infopage exists and return it

    const infopage = await Infopage.findById(infopageId)

    if (!infopage) {
      return response.status(404).send()
    }

    return response.status(200).json(infopage)

  } catch (error) {
    logger.error(error)

    return response.status(500).send(error)
  }
})

router.route('/infopage/:infopageId').put(async (request, response) => {
  try {
    const infopageId = request.params.infopageId
    const authorization = request.headers.authorization
    const infopagePut = request.body

    /// Check authorization

    const user = await User.findOne()

    if (user.session_id !== authorization) {
      return response.status(401).json({ 'message': 'unauthorized' })
    }

    /// Try to update infopage an return it

    delete infopagePut._id

    const updatedInfopage = await Infopage.findOneAndUpdate({ _id: infopageId }, infopagePut)

    if (!updatedInfopage) {
      return response.status(404).send()
    }

    return response.status(200).json(updatedInfopage)

  } catch (error) {
    logger.error(error)

    return response.status(500).send(error)
  }
})

router.route('/infopage/:infopageId').patch(async (request, response) => {
  try {
    const infopageId = request.params.infopageId
    const authorization = request.headers.authorization
    const infopagePatch = request.body

    /// Check authorization

    const user = await User.findOne()

    if (user.session_id !== authorization) {
      return response.status(401).json({ 'message': 'unauthorized' })
    }

    /// Update and return infopage

    delete infopagePatch._id

    const updatedInfopage = await Infopage.findOneAndUpdate({ _id: infopageId }, infopagePatch)

    return response.status(200).json(updatedInfopage)

  } catch (error) {
    logger.error(error)

    return response.status(500).send(error)
  }
})

router.route('/infopage/:infopageId').delete(async (request, response) => {
  try {
    const infopageId = request.params.infopageId
    const authorization = request.headers.authorization

    /// Check authorization

    const user = await User.findOne()

    if (user.session_id !== authorization) {
      return response.status(401).json({ 'message': 'unauthorized' })
    }

    /// Remove infopage from database

    const infopage = await Infopage.findByIdAndRemove(infopageId)

    if (!infopage) {
      return response.status(404).send()
    }

    return response.status(200).json(infopage)

  } catch (error) {
    logger.error(error)

    return response.status(500).send(error)
  }
})

module.exports = { router }
