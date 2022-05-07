const express = require('express')
const fileUpload = require('express-fileupload')

const logger = require('../logging')

const router = express.Router()

router.use(fileUpload({createParentPath: true}))

router.route('/logs').post((request, response) => {
  const message = request.body
  if (message.level < 4) {
    logger.info(message)
  } else {
    logger.error(message)
  }

  response.status(201).send()
})

module.exports = router
