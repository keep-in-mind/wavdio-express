const express = require('express')
const rimraf = require('rimraf')

const logger = require('../logging')

const { Exhibit } = require('../models/exhibit')
const { Exposition } = require('../models/exposition')
const { User } = require('../models/user')

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
    const postExposition = request.body

    /// Check authorization

    const user = await User.findOne()

    if (user.session_id !== authorization) {
      return response.status(401).json({ 'message': 'unauthorized' })
    }

    /// Create exposition

    const createdExposition = await Exposition.create(postExposition)

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

    Exposition.findById(expositionId, (error, exposition) => {
      if (error) {
        logger.error(error)
        response.status(500).send(error)
      } else if (exposition) {
        response.status(200).json(exposition)
      } else {
        response.status(404).send()
      }
    })

  } catch (error) {
    logger.error(error)

    return response.status(500).send(error)
  }
})

router.route('/exposition/:expositionId').put(async (request, response) => {
  try {
    const expositionId = request.params.expositionId
    const authorization = request.headers.authorization
    const body = request.body

    /// Check authorization

    const user = await User.findOne()

    if (user.session_id !== authorization) {
      return response.status(401).json({ 'message': 'unauthorized' })
    }

    delete body._id
    Exposition.findOneAndUpdate({ _id: expositionId }, body, (error, exposition) => {
      if (error && error.name === 'ValidationError') {
        response.status(400).json({ 'message': error.message })
      } else if (error) {
        logger.error(error)
        response.status(500).send(error)
      } else if (exposition) {
        response.status(200).json(exposition)
      } else {
        response.status(404).send()
      }
    })

  } catch (error) {
    logger.error(error)

    return response.status(500).send(error)
  }
})

router.route('/exposition/:expositionId').patch(async (request, response) => {
  try {
    const expositionId = request.params.expositionId
    const authorization = request.headers.authorization
    const body = request.body

    /// Check authorization

    const user = await User.findOne()

    if (user.session_id !== authorization) {
      return response.status(401).json({ 'message': 'unauthorized' })
    }

    delete body._id
    Exposition.updateOne({ _id: expositionId }, body, (error, exposition) => {
      if (error && error.name === 'ValidationError') {
        response.status(400).json({ 'message': error.message })
      } else if (error) {
        logger.error(error)
        response.status(500).send(error)
      } else {
        response.status(200).json(exposition)
      }
    })

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

    /* Remove child exhibits from DB */

    const exhibits = await Exhibit.find({ parent: expositionId })

    for (const exh of exhibits) {
      await Exhibit.findByIdAndRemove(exh._id)
      rimraf.sync(`uploads/${exh._id}`)
    }

    /* Remove exposition from DB. Invalid ID -> 404 Not Found */

    const expo = await Exposition.findByIdAndRemove(expositionId)

    if (!expo) {
      logger.warn(`No exposition with ID ${expositionId}`)
      response.status(404).send()
      return
    }

    /* Remove directory from file system. Send 200 OK */

    rimraf.sync(`uploads/${expositionId}`)
    response.status(200).json(expo)

  } catch (error) {
    logger.error(error)

    return response.status(500).send(error)
  }
})

router.route('/exposition/:expositionId/like').post(async (request, response) => {
  try {
    const expositionId = request.params.expositionId
    const body = request.body

    Exposition.findByIdAndUpdate(expositionId, { $push: { likes: body } }, { new: true }, (error, exposition) => {
      if (error && error.name === 'ValidationError') {
        response.status(400).json({ 'message': error.message })
      } else if (error) {
        logger.log(error)
        response.status(500).send(error)
      } else if (exposition) {
        response.status(200).json(exposition)
      } else {
        response.status(404).send()
      }
    })

  } catch (error) {
    logger.error(error)

    return response.status(500).send(error)
  }
})

router.route('/exposition/:expositionId/like/:likeId').delete(async (request, response) => {
  try {
    const expositionId = request.params.expositionId
    const likeId = request.params.likeId

    Exposition.findByIdAndUpdate(expositionId, { $pull: { likes: { _id: likeId } } }, { new: true }, (error, exposition) => {
      if (error && error.name === 'ValidationError') {
        response.status(400).json({ 'message': error.message })
      } else if (error) {
        logger.log(error)
        response.status(500).send(error)
      } else if (exposition) {
        response.status(200).send(exposition)
      } else {
        response.status(404).send()
      }
    })

  } catch (error) {
    logger.error(error)

    return response.status(500).send(error)
  }
})

router.route('/exposition/:expositionId/comment_like').patch(async (request, response) => {
  try {
    const expositionId = request.params.expositionId
    const body = request.body

    Exposition.findByIdAndUpdate(expositionId, {
      comments: body.comments, likes: body.likes
    }, (error, exposition) => {
      if (error && error.name === 'ValidationError') {
        response.status(400).json({ 'message': error.message })
      } else if (error) {
        logger.log(error)
        response.status(500).send(error)
      } else if (exposition) {
        response.status(200).json(exposition)
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
