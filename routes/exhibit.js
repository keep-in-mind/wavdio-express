const express = require('express')
const rimraf = require('rimraf')

const logger = require('../logging')

const { Exhibit } = require('../models/exhibit')
const { User } = require('../models/user')

const router = express.Router()

router.route('/exhibit').get((request, response) => {

  Exhibit.find((error, exhibits) => {
    if (error) {
      logger.error(error)
      response.status(500).send(error)
    } else {
      response.status(200).json(exhibits)
    }
  })
})

router.route('/exhibit').post((request, response) => {

  User.findOne({}, function (err, user_) {
    if (user_.session_id !== request.headers.authorization) {
      return response.status(401).json({ 'message': 'unauthorized' })
    } else {
      const body = request.body
      Exhibit.find({ parent: body.parent, code: body.code, active: true }, (error, exhibits) => {
        if (error) {
          logger.error(error)
          response.status(500).send(error)
        } else if (exhibits.length > 0 && body.active === true) {
          response.status(500).send({ 'error_code': '13' })
        } else {
          Exhibit.create(request.body, (error, exhibit) => {
            if (error && error.name === 'ValidationError') {
              response.status(400).json({ 'message': error.message })
            } else if (error) {
              console.log(error)
              response.status(500).send(error)
            } else {
              response.status(201).json(exhibit)
            }
          })
        }
      })
    }
  })
})

router.route('/exhibit/:exhibit_id').get((request, response) => {

  Exhibit.findById(request.params.exhibit_id, (error, exhibit) => {
    if (error) {
      logger.error(error)
      response.status(500).send(error)
    } else if (exhibit) {
      response.status(200).json(exhibit)
    } else {
      response.status(404).send()
    }
  })
})

router.route('/exhibit/:exhibit_id').put((request, response) => {

  User.findOne({}, function (err, user_) {
    if (user_.session_id !== request.headers.authorization) {
      return response.status(401).json({ 'message': 'unauthorized' })
    } else {
      const body = request.body
      delete body._id
      Exhibit.findOneAndUpdate({ _id: request.params.exhibit_id }, body, (error, exhibit) => {
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
    }
  })
})

router.route('/exhibit/:exhibit_id').patch(async (request, response) => {

  try {
    const user_ = await User.findOne({})

    if (user_.session_id !== request.headers.authorization) {
      return response.status(401).json({ 'message': 'unauthorized' })
    }

    const body = request.body
    let old_code = 0
    let old_active = true

    const exhibit_ = await Exhibit.findOne({ _id: body._id })

    old_code = exhibit_.code
    old_active = exhibit_.active
    delete body._id

    const exhibits = await Exhibit.find({ parent: body.parent, code: body.code, active: true })

    if (
      // Anderes Exponat existiert mit dem code, der geändert wurde
      (exhibits.length > 0 && body.code !== old_code && body.active === true) ||
      // Anderes Exponat existiert mit dem alten code, darf nicht auf active gesetzt werden
      (exhibits.length > 0 && body.code === old_code && body.active === true && old_active === false)) {

      response.status(500).send({ 'error_code': '13' })

    } else {
      const exhibit__ = await Exhibit.findOneAndUpdate({ _id: request.params.exhibit_id }, body)

      if (exhibit__) {
        response.status(200).json(exhibit__)
      } else {
        response.status(404).send()
      }
    }

  } catch (error) {
    console.error(error)

    if (error && error.name === 'ValidationError') {
      response.status(400).json({ 'message': error.message })

    } else if (error) {
      response.status(500).send(error)
    }
  }
})

router.route('/exhibit/:exhibit_id').delete(async (request, response) => {

  const exhibitId = request.params.exhibit_id

  try {

    /* Authenticate */

    const u = await User.findOne({})

    if (u.session_id !== request.headers.authorization) {
      response.status(401).json({ 'message': 'unauthorized' })
      return
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
    response.status(500).send(error)
  }
})

router.route('/exhibit/:exhibit_id/like').post((request, response) => {
  const exhibitId = request.params.exhibit_id
  const like = request.body

  Exhibit.findByIdAndUpdate(exhibitId, { $push: { likes: like } }, { new: true }, (error, exhibit) => {
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
})

router.route('/exhibit/:exhibit_id/like/:like_id').delete((request, response) => {
  const exhibitId = request.params.exhibit_id
  const likeId = request.params.like_id

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
})

router.route('/exhibit/:exhibit_id/comment_like')

  .patch((request, response) => {
    const exhibitId = request.params.exhibit_id
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
  })

module.exports = router
