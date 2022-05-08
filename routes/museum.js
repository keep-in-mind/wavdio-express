const express = require('express')

const logger = require('../logging')

const { Museum } = require('../models/museum')
const { User } = require('../models/user')

const router = express.Router()

router.route('/museum').get(async (_request, response) => {
  try {
    const museums = await Museum.find()

    return response.status(200).json(museums)

  } catch (error) {
    logger.error(error)

    return response.status(500).send(error)
  }
})

router.route('/museum').post(async (request, response) => {
  try {
    const authorization = request.headers.authorization
    const museumPost = request.body

    /// Check authorization

    const user = await User.findOne()

    if (user.session_id !== authorization) {
      return response.status(401).json({ 'message': 'unauthorized' })
    }

    /// Create museum

    const createdMuseum = await Museum.create(museumPost)

    return response.status(201).json(createdMuseum)

  } catch (error) {
    logger.error(error)

    if (error.name === 'ValidationError') {
      return response.status(400).json({ 'message': error.message })
    }

    return response.status(500).send(error)
  }
})

router.route('/museum/:museumId').get(async (request, response) => {
  try {
    const museumId = request.params.museumId

    /// Check if museum exists and return it

    const museum = await Museum.findById(museumId)

    if (!museum) {
      return response.status(404).send()
    }

    return response.status(200).json(museum)

  } catch (error) {
    logger.error(error)

    return response.status(500).send(error)
  }
})

router.route('/museum/:museumId').put(async (request, response) => {
  try {
    const museumId = request.params.museumId
    const authorization = request.headers.authorization
    const museumPut = request.body

    /// Check authorization

    const user = await User.findOne()

    if (user.session_id !== authorization) {
      return response.status(401).json({ 'message': 'unauthorized' })
    }

    /// Try to update museum an return it

    delete museumPut._id

    const updatedMuseum = await Museum.findOneAndUpdate({ _id: museumId }, museumPut)

    if (!updatedMuseum) {
      return response.status(404).send()
    }

    return response.status(200).json(updatedMuseum)

  } catch (error) {
    logger.error(error)

    return response.status(500).send(error)
  }
})

router.route('/museum/:museumId').patch(async (request, response) => {
  try {
    const museumId = request.params.museumId
    const authorization = request.headers.authorization
    const museumPatch = request.body

    /// Check authorization

    const user = await User.findOne()

    if (user.session_id !== authorization) {
      return response.status(401).json({ 'message': 'unauthorized' })
    }

    /// Update and return museum

    delete museumPatch._id

    const updatedMuseum = await Museum.findOneAndUpdate({ _id: museumId }, museumPatch)

    return response.status(200).json(updatedMuseum)

  } catch (error) {
    logger.error(error)

    return response.status(500).send(error)
  }
})

router.route('/museum/:museumId').delete(async (request, response) => {
  try {
    const museumId = request.params.museumId
    const authorization = request.headers.authorization

    /// Check authorization

    const user = await User.findOne()

    if (user.session_id !== authorization) {
      return response.status(401).json({ 'message': 'unauthorized' })
    }

    /// Remove museum from database

    const museum = await Museum.findByIdAndRemove(museumId)

    if (!museum) {
      return response.status(404).send()
    }

    return response.status(200).json(museum)

  } catch (error) {
    logger.error(error)

    return response.status(500).send(error)
  }
})

module.exports = router
