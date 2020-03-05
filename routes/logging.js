const fileUpload = require("express-fileupload");
const express = require("express");
const router = express.Router();
const logger = require('../logging');
const fs = require('fs');

router.use(fileUpload({ createParentPath: true }));

router.get("/logs/:_type", (request, response) => {

  const _type = request.params._type;
  filename = 'logs/'+_type+'.log';

  fs.readFile(filename, function(err, content) {
      if (err) {
        logger.error(err);
        return response.status(500).send(err);
      }
      response.status(200).send(JSON.stringify(content.toString('utf-8')));
    });
});

router.route('/logs').post((request, response) => {
  const message = request.body;
  if (message.level < 4) {
    logger.info(message);
  } else {
    logger.error(message);
  }

  response.status(201).send();
});

module.exports = router;
