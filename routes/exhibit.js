const express = require('express')
const rimraf = require('rimraf')

const { Exhibit } = require('../models/exhibit')
const { User } = require('../models/user')
const { logger } = require('../logging')

const router = express.Router()

router.route('/exhibit').get(async (_request, response) => {
  try {
    const exhibits = await Exhibit.find()

    return response.status(200).json(exhibits)

  } catch (error) {
    logger.error(error)

    return response.status(500).json(error)
  }
})

router.route('/exhibit').post(async (request, response) => {
  try {
    const authorization = request.headers.authorization
    const exhibitPost = request.body

    /// Check authorization

    const user = await User.findOne()

    if (user.session_id !== authorization) {
      return response.status(401).json({ 'message': 'unauthorized' })
    }

    /// Check if exhibit already exists

    const exhibits = await Exhibit.find({ parent: exhibitPost.parent, code: exhibitPost.code, active: true })

    if (exhibits.length > 0 && exhibitPost.active === true) {
      return response.status(500).json({ 'error_code': '13' })
    }

    /// Create exhibit

    const createdExhibit = await Exhibit.create(exhibitPost)

    return response.status(201).json(createdExhibit)

  } catch (error) {
    logger.error(error)

    if (error.name === 'ValidationError') {
      return response.status(400).json({ 'message': error.message })
    }

    return response.status(500).send(error)
  }
})

router.route('/exhibit/:exhibitId').get(async (request, response) => {
  try {
    const exhibitId = request.params.exhibitId

    /// Check if exhibit exists and return it

    const exhibit = await Exhibit.findById(exhibitId)

    if (!exhibit) {
      return response.status(404).send()
    }

    return response.status(200).json(exhibit)

  } catch (error) {
    logger.error(error)

    return response.status(500).send(error)
  }
})

router.route('/exhibit/:exhibitId').put(async (request, response) => {
  try {
    const exhibitId = request.params.exhibitId
    const authorization = request.headers.authorization
    const exhibitPut = request.body

    /// Check authorization

    const user = await User.findOne()

    if (user.session_id !== authorization) {
      return response.status(401).json({ 'message': 'unauthorized' })
    }

    /// Try to update exhibit an return it

    delete exhibitPut._id

    const updatedExhibit = await Exhibit.findOneAndUpdate({ _id: exhibitId }, exhibitPut)

    if (!updatedExhibit) {
      return response.status(404).send()
    }

    return response.status(200).json(updatedExhibit)

  } catch (error) {
    logger.error(error)

    if (error && error.name === 'ValidationError') {
      response.status(400).json({ 'message': error.message })
    }

    return response.status(500).send(error)
  }
})

router.route('/exhibit/:exhibitId').patch(async (request, response) => {
  try {
    const exhibitId = request.params.exhibitId
    const authorization = request.headers.authorization
    const exhibitPatch = request.body

    /// Check authorization

    const user = await User.findOne()

    if (user.session_id !== authorization) {
      return response.status(401).json({ 'message': 'unauthorized' })
    }

    /// Check if exhibit exists

    const exhibit = await Exhibit.findOne({ _id: exhibitPatch._id })

    if (!exhibit) {
      return response.status(404).send()
    }

    /// Check if updated exhibit's code already in use

    const old_code = exhibit.code
    const old_active = exhibit.active

    const exhibits = await Exhibit.find({ parent: exhibitPatch.parent, code: exhibitPatch.code, active: true })

    if (
      // Anderes Exponat existiert mit dem code, der geändert wurde
      (exhibits.length > 0 && exhibitPatch.code !== old_code && exhibitPatch.active === true) ||
      // Anderes Exponat existiert mit dem alten code, darf nicht auf active gesetzt werden
      (exhibits.length > 0 && exhibitPatch.code === old_code && exhibitPatch.active === true && old_active === false)) {

      return response.status(500).json({ 'error_code': '13' })
    }

    /// Update and return exhibit

    delete exhibitPatch._id

    const updatedExhibit = await Exhibit.findOneAndUpdate({ _id: exhibitId }, exhibitPatch)

    return response.status(200).json(updatedExhibit)

  } catch (error) {
    logger.error(error)

    if (error && error.name === 'ValidationError') {
      return response.status(400).json({ 'message': error.message })
    }

    return response.status(500).send(error)
  }
})

router.route('/exhibit/:exhibitId').delete(async (request, response) => {
  try {
    const exhibitId = request.params.exhibitId
    const authorization = request.headers.authorization

    /// Check authorization

    const user = await User.findOne()

    if (user.session_id !== authorization) {
      return response.status(401).json({ 'message': 'unauthorized' })
    }

    /// Remove exhibit from database and file system

    const exhibit = await Exhibit.findByIdAndRemove(exhibitId)

    if (!exhibit) {
      return response.status(404).send()
    }

    rimraf.sync(`uploads/${exhibitId}`)

    return response.status(200).json(exhibit)

  } catch (error) {
    logger.error(error)

    return response.status(500).send(error)
  }
})

router.route('/exhibit/:exhibitId/like').post(async (request, response) => {
  try {
    const exhibitId = request.params.exhibitId
    const likePost = request.body

    /// Add like to exhibit

    const exhibit = await Exhibit.findByIdAndUpdate(exhibitId, { $push: { likes: likePost } }, { new: true })

    if (!exhibit) {
      return response.status(404).send()
    }

    return response.status(200).json(exhibit)

  } catch (error) {
    logger.error(error)

    if (error.name === 'ValidationError') {
      response.status(400).json({ 'message': error.message })
    }

    return response.status(500).send(error)
  }
})

router.route('/exhibit/:exhibitId/like/:likeId').delete(async (request, response) => {
  try {
    const exhibitId = request.params.exhibitId
    const likeId = request.params.likeId

    /// Remove like from exhibit

    const exhibit = await Exhibit.findByIdAndUpdate(exhibitId, { $pull: { likes: { _id: likeId } } }, { new: true })

    if (!exhibit) {
      return response.status(404).send()
    }

    return response.status(200).json(exhibit)

  } catch (error) {
    logger.error(error)

    if (error.name === 'ValidationError') {
      response.status(400).json({ 'message': error.message })
    }

    return response.status(500).send(error)
  }
})

router.route('/exhibit/:exhibitId/comment_like').patch(async (request, response) => {
  try {
    const exhibitId = request.params.exhibitId
    const commentLikePatch = request.body

    /// Update exhibit's comments and likes

    const exhibit = Exhibit.findByIdAndUpdate(exhibitId, { comments: commentLikePatch.comments, likes: commentLikePatch.likes })

    if (!exhibit) {
      return response.status(404).send()
    }

    return response.status(200).json(exhibit)

  } catch (error) {
    logger.error(error)

    if (error.name === 'ValidationError') {
      response.status(400).json({ 'message': error.message })
    }

    return response.status(500).send(error)
  }
})

module.exports = { router }
