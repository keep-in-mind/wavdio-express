const express = require('express');

const Museum = require('../models/museum');

const router = express.Router();
const logger = require('../logging');

const user = require('../models/user');

router.route('/museum')

  .get((request, response) => {
    Museum.find((error, museums) => {
      if (error) {
        logger.error(error);
        response.status(500).send(error);
      } else {
        response.status(200).json(museums);
      }
    });
  })

  .post((request, response) => {

    user.findOne({}, function (err, user_) {
      if (user_.session_id !== request.headers.authorization) {
        return response.status(401).json({ 'message': 'unauthorized' })
      } else {
        Museum.create(request.body, (error, museum) => {
          if (error) {
            logger.log(error);
            response.status(500).send(error);
          } else {
            response.status(201).json(museum);
          }
        });
      }
    })
  });

router.route('/museum/:museum_id')

  .get((request, response) => {
    Museum.findById(request.params.museum_id, (error, museum) => {
      if (error) {
        logger.error(error);
        response.status(500).send(error);
      } else if (museum) {
        response.status(200).json(museum);
      } else {
        response.status(404).send();
      }
    });
  })

  .put((request, response) => {
    user.findOne({}, function (err, user_) {
      if (user_.session_id !== request.headers.authorization) {
        return response.status(401).json({ 'message': 'unauthorized' })
      } else {
        const body = request.body;
        delete body._id;
        Museum.findOneAndUpdate({ _id: request.params.museum_id }, body, (error, museum) => {
          if (error) {
            logger.log(error);
            response.status(500).send(error);
          } else if (museum) {
            response.status(200).json(museum);
          } else {
            response.status(404).send();
          }
        });
      }
    })
  })

  .patch((request, response) => {

    user.findOne({}, function (err, user_) {
      if (user_.session_id !== request.headers.authorization) {
        return response.status(401).json({ 'message': 'unauthorized' })

      } else {
        const body = request.body;
        delete body._id;
        Museum.updateOne({ _id: request.params.museum_id }, body, (error, museum) => {
          if (error) {
            logger.log(error);
            response.status(500).send(error);
          } else {
            response.status(200).json(museum);
          }
        });
      }
    })
  })

  .delete((request, response) => {

    user.findOne({}, function (err, user_) {
      if (user_.session_id !== request.headers.authorization) {
        return response.status(401).json({ 'message': 'unauthorized' })
      } else {
        Museum.findOneAndRemove({ _id: request.params.museum_id }, (error, museum) => {
          if (error) {
            logger.log(error);
            response.status(500).send(error);
          } else if (museum) {
            response.status(200).json(museum);
          } else {
            response.status(404).send();
          }
        });
      }
    })
  });

module.exports = router;
