const express = require('express');

const Settings = require('../models/settings');

const router = express.Router();
const logger = require('../logging');

const user = require('../models/user');

router.route('/settings')

  .get((request, response) => {
    Settings.find((error, settings) => {
      if (error) {
        logger.error(error);
        response.status(500).send(error);
      } else {
        response.status(200).json(settings);
      }
    });
  })

  .post((request, response) => {

    user.findOne({}, function (err, user_) {
      if (user_.session_id !== request.headers.authorization) {
        return response.status(401).json({ 'message': 'unauthorized' })
      } else {
        Settings.create(request.body, (error, settings) => {
          if (error) {
            logger.log(error);
            response.status(500).send(error);
          } else {
            response.status(201).json(settings);
          }
        });
      }
    })
  });

router.route('/settings/:settings_id')

  .get((request, response) => {
    Settings.findById(request.params.settings_id, (error, settings) => {
      if (error) {
        logger.error(error);
        response.status(500).send(error);
      } else if (settings) {
        response.status(200).json(settings);
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
        Settings.findOneAndUpdate({ _id: request.params.settings_id }, body, (error, settings) => {
          if (error) {
            logger.log(error);
            response.status(500).send(error);
          } else if (settings) {
            response.status(200).json(settings);
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
        Settings.updateOne({ _id: request.params.settings_id }, body, (error, settings) => {
          if (error) {
            logger.log(error);
            response.status(500).send(error);
          } else {
            response.status(200).json(settings);
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
        Settings.findOneAndRemove({ _id: request.params.settings_id }, (error, settings) => {
          if (error) {
            logger.log(error);
            response.status(500).send(error);
          } else if (settings) {
            response.status(200).json(settings);
          } else {
            response.status(404).send();
          }
        });
      }
    })
  });

module.exports = router;
