const express = require('express')

const logger = require('../logging')

const { Infopage } = require('../models/infopage')
const { User } = require('../models/user')

const router = express.Router()

router.route('/infopage')

  .get((request, response) => {
    Infopage.find((error, infopages) => {
      if (error) {
        logger.error(error)
        response.status(500).send(error)
      } else {
        response.status(200).json(infopages)
      }
    })
  })

  .post((request, response) => {

    User.findOne({}, function (err, user_) {
      if (user_.session_id !== request.headers.authorization) {
        return response.status(401).json({ 'message': 'unauthorized' })
      } else {
        Infopage.create(request.body, (error, infopage) => {
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
  })

router.route('/infopage/:infopage_id')

  .get((request, response) => {
    Infopage.findById(request.params.infopage_id, (error, infopage) => {
      if (error) {
        logger.error(error)
        response.status(500).send(error)
      } else if (infopage) {
        response.status(200).json(infopage)
      } else {
        response.status(404).send()
      }
    })
  })

  .put((request, response) => {

    User.findOne({}, function (err, user_) {
      if (user_.session_id !== request.headers.authorization) {
        return response.status(401).json({ 'message': 'unauthorized' })
      } else {
        const body = request.body
        delete body._id
        Infopage.findOneAndUpdate({ _id: request.params.infopage_id }, body, (error, infopage) => {
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
  })

  .patch((request, response) => {

    User.findOne({}, function (err, user_) {
      if (user_.session_id !== request.headers.authorization) {
        return response.status(401).json({ 'message': 'unauthorized' })

      } else {
        const body = request.body
        delete body._id
        Infopage.updateOne({ _id: request.params.infopage_id }, body, (error, infopage) => {
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
  })

  .delete((request, response) => {

    User.findOne({}, function (err, user_) {
      if (user_.session_id !== request.headers.authorization) {
        return response.status(401).json({ 'message': 'unauthorized' })
      } else {
        Infopage.findOneAndRemove({ _id: request.params.infopage_id }, (error, infopage) => {
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
  })

module.exports = router
