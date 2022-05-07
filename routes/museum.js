const express = require('express')

const logger = require('../logging')

const { Museum } = require('../models/museum')
const { User } = require('../models/user')

const router = express.Router()

router.route('/museum').get((request, response) => {

  Museum.find((error, museums) => {
    if (error) {
      logger.error(error)
      response.status(500).send(error)
    } else {
      response.status(200).json(museums)
    }
  })
})

router.route('/museum').post((request, response) => {

  User.findOne({}, function (err, user_) {
    if (user_.session_id !== request.headers.authorization) {
      return response.status(401).json({ 'message': 'unauthorized' })
    } else {
      Museum.create(request.body, (error, museum) => {
        if (error && error.name === 'ValidationError') {
          response.status(400).json({ 'message': error.message })
        } else if (error) {
          logger.log(error)
          response.status(500).send(error)
        } else {
          response.status(201).json(museum)
        }
      })
    }
  })
})

router.route('/museum/:museum_id')

  .get((request, response) => {
    Museum.findById(request.params.museum_id, (error, museum) => {
      if (error) {
        logger.error(error)
        response.status(500).send(error)
      } else if (museum) {
        response.status(200).json(museum)
      } else {
        response.status(404).send()
      }
    })
  })

router.route('/museum/:museum_id').put((request, response) => {

  User.findOne({}, function (err, user_) {
    if (user_.session_id !== request.headers.authorization) {
      return response.status(401).json({ 'message': 'unauthorized' })
    } else {
      const body = request.body
      delete body._id
      Museum.findOneAndUpdate({ _id: request.params.museum_id }, body, (error, museum) => {
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
    }
  })
})

router.route('/museum/:museum_id').patch((request, response) => {

  User.findOne({}, function (err, user_) {
    if (user_.session_id !== request.headers.authorization) {
      return response.status(401).json({ 'message': 'unauthorized' })

    } else {
      const body = request.body
      delete body._id
      Museum.updateOne({ _id: request.params.museum_id }, body, (error, museum) => {
        if (error && error.name === 'ValidationError') {
          response.status(400).json({ 'message': error.message })
        } else if (error) {
          logger.log(error)
          response.status(500).send(error)
        } else {
          response.status(200).json(museum)
        }
      })
    }
  })
})

router.route('/museum/:museum_id').delete((request, response) => {

  User.findOne({}, function (err, user_) {
    if (user_.session_id !== request.headers.authorization) {
      return response.status(401).json({ 'message': 'unauthorized' })
    } else {
      Museum.findOneAndRemove({ _id: request.params.museum_id }, (error, museum) => {
        if (error) {
          logger.log(error)
          response.status(500).send(error)
        } else if (museum) {
          response.status(200).json(museum)
        } else {
          response.status(404).send()
        }
      })
    }
  })
})

module.exports = router
