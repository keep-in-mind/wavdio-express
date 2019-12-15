const express = require('express');
const fs = require('fs');
const fileUpload = require('express-fileupload');

const router = express.Router();
const logger = require('../logging');

router.use(fileUpload({createParentPath: true}));
const user = require('../models/user');

router

  .post('/:_id', (request, response) => {
    if (Object.keys(request.files).length === 0) {
      return response.status(400).send('No files were uploaded.');
    }

    const _id = request.params._id;
    const file = request.files.file;

    file.mv(`uploads/${_id}/${file.name}`, error => {
      if (error) {
        logger.error(error);
        return response.status(500).send(error);
      }

      response.status(201).send();
    });
  })

  .delete('/:_id/:file_name', (request, response) => {
    const _id = request.params._id;
    const file_name = request.params.file_name;

    fs.unlink(`uploads/${_id}/${file_name}`, (error) => {
      if (error) {
        return response.status(500).send(error);
      }

      response.status(200).send();
    });
  });

module.exports = router;
