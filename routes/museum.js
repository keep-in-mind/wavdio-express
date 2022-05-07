const express = require('express')

const logger = require('../logging')

const { Museum } = require('../models/museum')
const { User } = require('../models/user')

const router = express.Router()

router.route('/museum').get(async (_request, response) => {
  try {
    const museums = Museum.find()

    return response.status(200).json(museums)

  } catch (error) {
    logger.error(error)

    return response.status(500).send(error)
  }
})

router.route('/museum').post(async (request, response) => {
  try {
    const authorization = request.headers.authorization
    const body = request.body

    /// Check authorization

    const user = await User.findOne({})

    if (user.session_id !== authorization) {
      return response.status(401).json({ 'message': 'unauthorized' })
    }

    Museum.create(body, (error, museum) => {
      if (error && error.name === 'ValidationError') {
        response.status(400).json({ 'message': error.message })
      } else if (error) {
        logger.log(error)
        response.status(500).send(error)
      } else {
        response.status(201).json(museum)
      }
    })

  } catch (error) {
    logger.error(error)

    return response.status(500).send(error)
  }
})

router.route('/museum/:museumId').get(async (request, response) => {
  try {
    const museumId = request.params.museumId

    Museum.findById(museumId, (error, museum) => {
      if (error) {
        logger.error(error)
        response.status(500).send(error)
      } else if (museum) {
        response.status(200).json(museum)
      } else {
        response.status(404).send()
      }
    })

  } catch (error) {
    logger.error(error)

    return response.status(500).send(error)
  }
})

router.route('/museum/:museumId').put(async (request, response) => {
  try {
    const museumId = request.params.museumId
    const authorization = request.headers.authorization
    const body = request.body

    /// Check authorization

    const user = await User.findOne({})

    if (user.session_id !== authorization) {
      return response.status(401).json({ 'message': 'unauthorized' })
    }

    delete body._id
    Museum.findOneAndUpdate({ _id: museumId }, body, (error, museum) => {
      if (error && error.name === 'ValidationError') {
        response.status(400).json({ 'message': error.message })
      } else if (error) {
        logger.log(error)
        response.status(500).send(error)
      } else if (museum) {
        response.status(200).json(museum)
      } else {
        response.status(404).send()
      }
    })

  } catch (error) {
    logger.error(error)

    return response.status(500).send(error)
  }
})

router.route('/museum/:museumId').patch(async (request, response) => {
  try {
    const museumId = request.params.museumId
    const authorization = request.headers.authorization
    const body = request.body

    /// Check authorization

    const user = await User.findOne({})

    if (user.session_id !== authorization) {
      return response.status(401).json({ 'message': 'unauthorized' })
    }

    delete body._id
    Museum.updateOne({ _id: museumId }, body, (error, museum) => {
      if (error && error.name === 'ValidationError') {
        response.status(400).json({ 'message': error.message })
      } else if (error) {
        logger.log(error)
        response.status(500).send(error)
      } else {
        response.status(200).json(museum)
      }
    })

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

    const user = await User.findOne({})

    if (user.session_id !== authorization) {
      return response.status(401).json({ 'message': 'unauthorized' })
    }

    Museum.findOneAndRemove({ _id: museumId }, (error, museum) => {
      if (error) {
        logger.log(error)
        response.status(500).send(error)
      } else if (museum) {
        response.status(200).json(museum)
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
