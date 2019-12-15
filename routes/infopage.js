const express = require('express');

const infopage = require('../models/infopage');

const user = require('../models/user');

const router = express.Router();
const logger = require('../logging');

router.route('/infopage')

  .get((request, response) => {
    infopage.find((error, infopages) => {
      if (error) {
        logger.error(error);
        response.status(500).send(error);
      } else {
        response.status(200).json(infopages);
      }
    });
  })

  .post((request, response) => {

    user.findOne({}, function (err, user_) {
      if (user_.session_id !== request.headers.authorization) {
        return response.status(401).json({'message': 'unauthorized'})
      } else {
        infopage.create(request.body, (error, infopage) => {
          if (error) {
            logger.log(error);
            response.status(500).send(error);
          } else {
            response.status(201).json(infopage);
          }
        });
      }
    })
  });

router.route('/infopage/:infopage_id')

  .get((request, response) => {
    infopage.findById(request.params.infopage_id, (error, infopage) => {
      if (error) {
        logger.error(error);
        response.status(500).send(error);
      } else if (infopage) {
        response.status(200).json(infopage);
      } else {
        response.status(404).send();
      }
    });
  })

  .put((request, response) => {

    user.findOne({}, function (err, user_) {
      if (user_.session_id !== request.headers.authorization) {
        return response.status(401).json({'message': 'unauthorized'})
      } else {
        const body = request.body;
        delete body._id;
        infopage.findOneAndUpdate({_id: request.params.infopage_id}, body, (error, infopage) => {
          if (error) {
            loger.log(error);
            response.status(500).send(error);
          } else if (infopage) {
            response.status(200).json(infopage);
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
        return response.status(401).json({'message': 'unauthorized'})

      } else {
        const body = request.body;
        delete body._id;
        infopage.updateOne({_id: request.params.infopage_id}, body, (error, infopage) => {
          if (error) {
            logger.log(error);
            response.status(500).send(error);
          } else {
            response.status(200).json(infopage);
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
    infopage.findOneAndRemove({_id: request.params.infopage_id}, (error, infopage) => {
      if (error) {
        logger.error(error);
        response.status(500).send(error);
      } else if (infopage) {
        response.status(200).json(infopage);
      } else {
        response.status(404).send();
      }
    });
      }
    })
  });

module.exports = router;
