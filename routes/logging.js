const fileUpload = require("express-fileupload");
const express = require("express");
const router = express.Router();
const logger = require('../logging');

router.use(fileUpload({ createParentPath: true }));

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
