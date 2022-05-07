const express = require('express')
const fileUpload = require('express-fileupload')

const logger = require('../logging')

const router = express.Router()

router.use(fileUpload({ createParentPath: true }))

router.route('/logs').post(async (request, response) => {
  try {
    const postLog = request.body

    if (postLog.level < 4) {
      logger.info(postLog)
    } else {
      logger.error(postLog)
    }

    response.status(201).send()

  } catch (error) {
    logger.error(error)

    return response.status(500).send(error)
  }
})

module.exports = router
