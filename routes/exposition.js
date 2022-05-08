const express = require('express')
const rimraf = require('rimraf')

const { Exhibit } = require('../models/exhibit')
const { Exposition } = require('../models/exposition')
const { User } = require('../models/user')
const { logger } = require('../logging')

const router = express.Router()

router.route('/exposition').get(async (_request, response) => {
  try {
    const expositions = await Exposition.find()

    return response.status(200).json(expositions)

  } catch (error) {
    logger.error(error)

    return response.status(500).send(error)
  }
})

router.route('/exposition').post(async (request, response) => {
  try {
    const authorization = request.headers.authorization
    const expositionPost = request.body

    /// Check authorization

    const user = await User.findOne()

    if (user.session_id !== authorization) {
      return response.status(401).json({ 'message': 'unauthorized' })
    }

    /// Create exposition

    const createdExposition = await Exposition.create(expositionPost)

    return response.status(201).json(createdExposition)

  } catch (error) {
    logger.error(error)

    if (error.name === 'ValidationError') {
      return response.status(400).json({ 'message': error.message })
    }

    return response.status(500).send(error)
  }
})

router.route('/exposition/:expositionId').get(async (request, response) => {
  try {
    const expositionId = request.params.expositionId

    /// Check if exposition exists and return it

    const exposition = await Exposition.findById(expositionId)

    if (!exposition) {
      return response.status(404).send()
    }

    return response.status(200).json(exposition)

  } catch (error) {
    logger.error(error)

    return response.status(500).send(error)
  }
})

router.route('/exposition/:expositionId').put(async (request, response) => {
  try {
    const expositionId = request.params.expositionId
    const authorization = request.headers.authorization
    const expositionPut = request.body

    /// Check authorization

    const user = await User.findOne()

    if (user.session_id !== authorization) {
      return response.status(401).json({ 'message': 'unauthorized' })
    }

    /// Try to update exposition an return it

    delete expositionPut._id

    const updatedExposition = await Exposition.findOneAndUpdate({ _id: expositionId }, expositionPut)

    if (!updatedExposition) {
      return response.status(404).send()
    }

    return response.status(200).json(updatedExposition)

  } catch (error) {
    logger.error(error)

    return response.status(500).send(error)
  }
})

router.route('/exposition/:expositionId').patch(async (request, response) => {
  try {
    const expositionId = request.params.expositionId
    const authorization = request.headers.authorization
    const expositionPatch = request.body

    /// Check authorization

    const user = await User.findOne()

    if (user.session_id !== authorization) {
      return response.status(401).json({ 'message': 'unauthorized' })
    }

    /// Update and return exposition

    delete expositionPatch._id

    const updatedExposition = await Exposition.findOneAndUpdate({ _id: expositionId }, expositionPatch)

    return response.status(200).json(updatedExposition)

  } catch (error) {
    logger.error(error)

    return response.status(500).send(error)
  }
})

router.route('/exposition/:expositionId').delete(async (request, response) => {
  try {
    const expositionId = request.params.expositionId
    const authorization = request.headers.authorization

    /// Check authorization

    const user = await User.findOne()

    if (user.session_id !== authorization) {
      return response.status(401).json({ 'message': 'unauthorized' })
    }

    /// Remove child exhibits from database and file system

    const exhibits = await Exhibit.find({ parent: expositionId })

    for (const exhibit of exhibits) {
      await Exhibit.findByIdAndRemove(exhibit._id)

      rimraf.sync(`uploads/${exhibit._id}`)
    }

    /// Remove exposition from database and file system

    const exposition = await Exposition.findByIdAndRemove(expositionId)

    if (!exposition) {
      return response.status(404).send()
    }

    rimraf.sync(`uploads/${expositionId}`)

    return response.status(200).json(exposition)

  } catch (error) {
    logger.error(error)

    return response.status(500).send(error)
  }
})

router.route('/exposition/:expositionId/like').post(async (request, response) => {
  try {
    const expositionId = request.params.expositionId
    const likePost = request.body

    /// Add like to exposition

    const exposition = await Exhibit.findByIdAndUpdate(expositionId, { $push: { likes: likePost } }, { new: true })

    if (!exposition) {
      return response.status(404).send()
    }

    return response.status(200).json(exposition)

  } catch (error) {
    logger.error(error)

    if (error.name === 'ValidationError') {
      response.status(400).json({ 'message': error.message })
    }

    return response.status(500).send(error)
  }
})

router.route('/exposition/:expositionId/like/:likeId').delete(async (request, response) => {
  try {
    const expositionId = request.params.expositionId
    const likeId = request.params.likeId

    /// Remove like from exposition

    const exposition = await Exposition.findByIdAndUpdate(expositionId, { $pull: { likes: { _id: likeId } } }, { new: true })

    if (!exposition) {
      return response.status(404).send()
    }

    return response.status(200).json(exposition)

  } catch (error) {
    logger.error(error)

    if (error.name === 'ValidationError') {
      response.status(400).json({ 'message': error.message })
    }

    return response.status(500).send(error)
  }
})

router.route('/exposition/:expositionId/comment_like').patch(async (request, response) => {
  try {
    const expositionId = request.params.expositionId
    const commentLikePatch = request.body

    /// Update exposition's comments and likes

    const exposition = Exposition.findByIdAndUpdate(expositionId, { comments: commentLikePatch.comments, likes: commentLikePatch.likes })

    if (!exposition) {
      return response.status(404).send()
    }

    return response.status(200).json(exposition)

  } catch (error) {
    logger.error(error)

    if (error.name === 'ValidationError') {
      response.status(400).json({ 'message': error.message })
    }

    return response.status(500).send(error)
  }
})

module.exports = { router }
