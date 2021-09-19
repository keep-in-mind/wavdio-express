const express = require('express')
const rimraf = require('rimraf')

const exhibit = require('../models/exhibit')
const exposition = require('../models/exposition')
const user = require('../models/user')

const router = express.Router()
const logger = require('../logging')

router.route('/exposition')

  .get((request, response) => {
    exposition.find((error, expositions) => {
      if (error) {
        logger.error(error)
        response.status(500).send(error)
      } else {
        response.status(200).json(expositions)
      }
    })
  })

  .post((request, response) => {
    user.findOne({}, function (err, user_) {
      if (user_.session_id !== request.headers.authorization) {
        return response.status(401).json({'message': 'unauthorized'})
      } else {
        exposition.create(request.body, (error, exposition) => {
          if (error) {
            console.error(error)
            response.status(500).send(error)
          } else {
            response.status(201).json(exposition)
          }
        })
      }
    })
  })

router.route('/exposition/:exposition_id')

  .get((request, response) => {
    exposition.findById(request.params.exposition_id, (error, exposition) => {
      if (error) {
        logger.error(error)
        response.status(500).send(error)
      } else if (exposition) {
        response.status(200).json(exposition)
      } else {
        response.status(404).send()
      }
    })
  })

  .put((request, response) => {
    user.findOne({}, function (err, user_) {
      if (user_.session_id !== request.headers.authorization) {
        return response.status(401).json({'message': 'unauthorized'})
      } else {
        const body = request.body
        delete body._id
        exposition.findOneAndUpdate({_id: request.params.exposition_id}, body, (error, exposition) => {
          if (error) {
            logger.error(error)
            response.status(500).send(error)
          } else if (exposition) {
            response.status(200).json(exposition)
          } else {
            response.status(404).send()
          }
        })
      }
    })
  })

  .patch((request, response) => {
    user.findOne({}, function (err, user_) {
      if (user_.session_id !== request.headers.authorization) {
        return response.status(401).json({'message': 'unauthorized'})
      } else {
        const body = request.body
        delete body._id
        exposition.updateOne({_id: request.params.exposition_id}, body, (error, exposition) => {
          if (error) {
            logger.error(error)
            response.status(500).send(error)
          } else {
            response.status(200).json(exposition)
          }
        })
      }
    })
  })

  .delete(async (request, response) => {
    const expositionId = request.params.exposition_id

    try {

      /* Authenticate */

      const u = await user.findOne({})

      if (u.session_id !== request.headers.authorization) {
        response.status(401).json({'message': 'unauthorized'})
        return
      }

      /* Remove child exhibits from DB */

      const exhibits = await exhibit.find({parent: expositionId})

      for (const exh of exhibits) {
        await exhibit.findByIdAndRemove(exh._id)
        rimraf.sync(`uploads/${exh._id}`)
      }

      /* Remove exposition from DB. Invalid ID -> 404 Not Found */

      const expo = await exposition.findByIdAndRemove(expositionId)

      if (!expo) {
        logger.warning(`No exposition with ID ${expositionId}`)
        response.status(404).send()
        return
      }

      /* Remove directory from file system. Send 200 OK */

      rimraf.sync(`uploads/${expositionId}`)
      response.status(200).json(expo)

    } catch (error) {
      logger.error(error)
      response.status(500).send(error)
    }
  })

router.route('/exposition/:exposition_id/like').post((request, response) => {
  const expositionId = request.params.exposition_id
  const like = request.body

  exposition.findByIdAndUpdate(expositionId, {$push: {likes: like}}, {new: true}, (error, exposition) => {
    if (error) {
      logger.log(error)
      response.status(500).send(error)
    } else if (exposition) {
      response.status(200).json(exposition)
    } else {
      response.status(404).send()
    }
  })
})

router.route('/exposition/:exposition_id/like/:like_id').delete((request, response) => {
  const expositionId = request.params.exposition_id
  const likeId = request.params.like_id

  exposition.findByIdAndUpdate(expositionId, {$pull: {likes: {_id: likeId}}}, {new: true}, (error, exposition) => {
    if (error) {
      logger.log(error)
      response.status(500).send(error)
    } else if (exposition) {
      response.status(200).send(exposition)
    } else {
      response.status(404).send()
    }
  })
})

router.route('/exposition/:exposition_id/comment_like')

  .patch((request, response) => {
    const expositionId = request.params.exposition_id
    const body = request.body
    exposition.findByIdAndUpdate(expositionId, {
      comments: body.comments, likes: body.likes
    }, (error, exposition) => {
      if (error) {
        logger.log(error)
        response.status(500).send(error)
      } else if (exposition) {
        response.status(200).json(exposition)
      } else {
        response.status(404).send()
      }
    })
  })

module.exports = router
