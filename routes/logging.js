const express = require('express')
const fileUpload = require('express-fileupload')

const logger = require('../logging')

const router = express.Router()

router.use(fileUpload({ createParentPath: true }))

router.route('/logs').post(async (request, response) => {
  try {

    const message = request.body
    if (message.level < 4) {
      logger.info(message)
    } else {
      logger.error(message)
    }

    response.status(201).send()

  } catch (error) {
    logger.error(error)

    return response.status(500).send(error)
  }
})

module.exports = router
