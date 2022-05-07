const express = require('express')

const logger = require('../logging')

const { Infopage } = require('../models/infopage')
const { User } = require('../models/user')

const router = express.Router()

router.route('/infopage').get(async (request, response) => {
  try {

    Infopage.find((error, infopages) => {
      if (error) {
        logger.error(error)
        response.status(500).send(error)
      } else {
        response.status(200).json(infopages)
      }
    })

  } catch (error) {
    logger.error(error)

    return response.status(500).send(error)
  }
})

router.route('/infopage').post(async (request, response) => {
  try {
    const authorization = request.headers.authorization
    const body = request.body

    User.findOne({}, function (err, user_) {
      if (user_.session_id !== authorization) {
        return response.status(401).json({ 'message': 'unauthorized' })
      } else {
        Infopage.create(body, (error, infopage) => {
          if (error && error.name === 'ValidationError') {
            response.status(400).json({ 'message': error.message })
          } else if (error) {
            logger.log(error)
            response.status(500).send(error)
          } else {
            response.status(201).json(infopage)
          }
        })
      }
    })

  } catch (error) {
    logger.error(error)

    return response.status(500).send(error)
  }
})

router.route('/infopage/:infopage_id').get(async (request, response) => {
  try {
    const infopageId = request.params.expositionId

    Infopage.findById(infopageId, (error, infopage) => {
      if (error) {
        logger.error(error)
        response.status(500).send(error)
      } else if (infopage) {
        response.status(200).json(infopage)
      } else {
        response.status(404).send()
      }
    })

  } catch (error) {
    logger.error(error)

    return response.status(500).send(error)
  }
})

router.route('/infopage/:infopage_id').put(async (request, response) => {
  try {
    const infopageId = request.params.expositionId
    const authorization = request.headers.authorization
    const body = request.body

    User.findOne({}, function (err, user_) {
      if (user_.session_id !== authorization) {
        return response.status(401).json({ 'message': 'unauthorized' })
      } else {
        delete body._id
        Infopage.findOneAndUpdate({ _id: infopageId }, body, (error, infopage) => {
          if (error && error.name === 'ValidationError') {
            response.status(400).json({ 'message': error.message })
          } else if (error) {
            logger.log(error)
            response.status(500).send(error)
          } else if (infopage) {
            response.status(200).json(infopage)
          } else {
            response.status(404).send()
          }
        })
      }
    })

  } catch (error) {
    logger.error(error)

    return response.status(500).send(error)
  }
})

router.route('/infopage/:infopage_id').patch(async (request, response) => {
  try {
    const infopageId = request.params.expositionId
    const authorization = request.headers.authorization
    const body = request.body

    User.findOne({}, function (err, user_) {
      if (user_.session_id !== authorization) {
        return response.status(401).json({ 'message': 'unauthorized' })

      } else {
        delete body._id
        Infopage.updateOne({ _id: infopageId }, body, (error, infopage) => {
          if (error && error.name === 'ValidationError') {
            response.status(400).json({ 'message': error.message })
          } else if (error) {
            logger.log(error)
            response.status(500).send(error)
          } else {
            response.status(200).json(infopage)
          }
        })
      }
    })

  } catch (error) {
    logger.error(error)

    return response.status(500).send(error)
  }
})

router.route('/infopage/:infopage_id').delete(async (request, response) => {
  try {
    const infopageId = request.params.expositionId
    const authorization = request.headers.authorization

    User.findOne({}, function (err, user_) {
      if (user_.session_id !== authorization) {
        return response.status(401).json({ 'message': 'unauthorized' })
      } else {
        Infopage.findOneAndRemove({ _id: infopageId }, (error, infopage) => {
          if (error) {
            logger.error(error)
            response.status(500).send(error)
          } else if (infopage) {
            response.status(200).json(infopage)
          } else {
            response.status(404).send()
          }
        })
      }
    })

  } catch (error) {
    logger.error(error)

    return response.status(500).send(error)
  }
})

module.exports = router
