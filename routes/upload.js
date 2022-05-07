const express = require('express')
const fileUpload = require('express-fileupload')
const fs = require('fs')

const logger = require('../logging')

const router = express.Router()

router.use(fileUpload({createParentPath: true}))

router

  .post('/:_id', (request, response) => {
    if (Object.keys(request.files).length === 0) {
      return response.status(400).send('No files were uploaded.')
    }

    const _id = request.params._id
    const file = request.files.file

    file.mv(`uploads/${_id}/${file.name}`, error => {
      if (error) {
        logger.error(error)
        return response.status(500).send(error)
      }

      response.status(201).send()
    })
  })

  .delete('/:_id/:file_name', (request, response) => {
    const _id = request.params._id
    const file_name = request.params.file_name

    fs.unlink(`uploads/${_id}/${file_name}`, (error) => {
      if (error) {
        return response.status(500).send(error)
      }

      response.status(200).send()
    })
  })

module.exports = router
