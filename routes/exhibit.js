const express = require('express')
const rimraf = require('rimraf')

const logger = require('../logging')

const { Exhibit } = require('../models/exhibit')
const { User } = require('../models/user')

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
    const body = request.body

    /// Check authorization

    const user = await User.findOne()

    if (user.session_id !== authorization) {
      return response.status(401).json({ 'message': 'unauthorized' })
    }

    /// Check if exhibit already exists

    const exhibits = await Exhibit.find({ parent: body.parent, code: body.code, active: true })

    if (exhibits.length > 0 && body.active === true) {
      return response.status(500).json({ 'error_code': '13' })
    }

    /// Create exhibit

    const createdExhibit = await Exhibit.create(body)

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

    Exhibit.findById(exhibitId, (error, exhibit) => {
      if (error) {
        logger.error(error)
        response.status(500).send(error)
      } else if (exhibit) {
        response.status(200).json(exhibit)
      } else {
        response.status(404).send()
      }
    })

  } catch (error) {
    logger.error(error)

    return response.status(500).send(error)
  }
})

router.route('/exhibit/:exhibitId').put(async (request, response) => {
  try {
    const exhibitId = request.params.exhibitId
    const authorization = request.headers.authorization
    const body = request.body

    /// Check authorization

    const user = await User.findOne()

    if (user.session_id !== authorization) {
      return response.status(401).json({ 'message': 'unauthorized' })
    }

    delete body._id
    Exhibit.findOneAndUpdate({ _id: exhibitId }, body, (error, exhibit) => {
      if (error && error.name === 'ValidationError') {
        response.status(400).json({ 'message': error.message })
      } else if (error) {
        logger.error(error)
        response.status(500).send(error)
      } else if (exhibit) {
        response.status(200).json(exhibit)
      } else {
        response.status(404).send()
      }
    })

  } catch (error) {
    logger.error(error)

    return response.status(500).send(error)
  }
})

router.route('/exhibit/:exhibitId').patch(async (request, response) => {
  try {
    const exhibitId = request.params.exhibitId
    const authorization = request.headers.authorization
    const body = request.body

    /// Check authorization

    const user = await User.findOne()

    if (user.session_id !== authorization) {
      return response.status(401).json({ 'message': 'unauthorized' })
    }

    /// Check if exhibit exists

    const exhibit = await Exhibit.findOne({ _id: body._id })

    if (!exhibit) {
      return response.status(404)
    }

    /// Check if updated exhibit's code already in use

    const old_code = exhibit.code
    const old_active = exhibit.active

    const exhibits = await Exhibit.find({ parent: body.parent, code: body.code, active: true })

    if (
      // Anderes Exponat existiert mit dem code, der geändert wurde
      (exhibits.length > 0 && body.code !== old_code && body.active === true) ||
      // Anderes Exponat existiert mit dem alten code, darf nicht auf active gesetzt werden
      (exhibits.length > 0 && body.code === old_code && body.active === true && old_active === false)) {

      return response.status(500).json({ 'error_code': '13' })
    }

    /// Update and return exhibit

    delete body._id

    const updatedExhibit = await Exhibit.findOneAndUpdate({ _id: exhibitId }, body)

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

    /* Remove from DB. Invalid ID -> 404 Not Found */

    const exh = await Exhibit.findByIdAndRemove(exhibitId)

    if (!exh) {
      logger.warn(`No exhibit with ID ${exhibitId}`)
      response.status(404).send()
      return
    }

    /* Remove directory from file system. Send 200 OK */

    rimraf.sync(`uploads/${exhibitId}`)
    response.status(200).json(exh)

  } catch (error) {
    logger.error(error)

    return response.status(500).send(error)
  }
})

router.route('/exhibit/:exhibitId/like').post(async (request, response) => {
  try {
    const exhibitId = request.params.exhibitId
    const body = request.body

    Exhibit.findByIdAndUpdate(exhibitId, { $push: { likes: body } }, { new: true }, (error, exhibit) => {
      if (error && error.name === 'ValidationError') {
        response.status(400).json({ 'message': error.message })
      } else if (error) {
        logger.log(error)
        response.status(500).send(error)
      } else if (exhibit) {
        response.status(200).json(exhibit)
      } else {
        response.status(404).send()
      }
    })

  } catch (error) {
    logger.error(error)

    return response.status(500).send(error)
  }
})

router.route('/exhibit/:exhibitId/like/:likeId').delete(async (request, response) => {
  try {
    const exhibitId = request.params.exhibitId
    const likeId = request.params.likeId

    Exhibit.findByIdAndUpdate(exhibitId, { $pull: { likes: { _id: likeId } } }, { new: true }, (error, exhibit) => {
      if (error && error.name === 'ValidationError') {
        response.status(400).json({ 'message': error.message })
      } else if (error) {
        logger.log(error)
        response.status(500).send(error)
      } else if (exhibit) {
        response.status(200).send(exhibit)
      } else {
        response.status(404).send()
      }
    })

  } catch (error) {
    logger.error(error)

    return response.status(500).send(error)
  }
})

router.route('/exhibit/:exhibitId/comment_like').patch(async (request, response) => {
  try {
    const exhibitId = request.params.exhibitId
    const body = request.body

    Exhibit.findByIdAndUpdate(exhibitId, {
      comments: body.comments, likes: body.likes
    }, (error, exhibit) => {
      if (error && error.name === 'ValidationError') {
        response.status(400).json({ 'message': error.message })
      } else if (error) {
        logger.log(error)
        response.status(500).send(error)
      } else if (exhibit) {
        response.status(200).json(exhibit)
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
