const express = require('express')
const fileUpload = require('express-fileupload')
const fs = require('fs')

const logger = require('../logging')

const router = express.Router()

router.use(fileUpload({ createParentPath: true }))

router.post('/:_id', (request, response) => {
  try {
    const id = request.params._id
    const files = request.files

    if (Object.keys(request.files).length === 0) {
      return response.status(400).send('No files were uploaded.')
    }

    const file = files.file

    file.mv(`uploads/${id}/${file.name}`, error => {
      if (error) {
        logger.error(error)
        return response.status(500).send(error)
      }

      response.status(201).send()
    })

  } catch (error) {
    logger.error(error)

    return response.status(500).send(error)
  }
})

router.delete('/:_id/:file_name', (request, response) => {
  try {
    const id = request.params._id
    const fileName = request.params.file_name

    fs.unlink(`uploads/${id}/${fileName}`, (error) => {
      if (error) {
        return response.status(500).send(error)
      }

      response.status(200).send()
    })

  } catch (error) {
    logger.error(error)

    return response.status(500).send(error)
  }
})

module.exports = router
