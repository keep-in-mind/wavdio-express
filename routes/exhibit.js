const express = require('express');
const rimraf = require('rimraf');

const logger = require('../logging');
const exhibit = require('../models/exhibit');
const user = require('../models/user');

const router = express.Router();

router.route('/exhibit')

  .get((request, response) => {
    exhibit.find((error, exhibits) => {
      if (error) {
        logger.error(error);
        response.status(500).send(error);
      } else {
        response.status(200).json(exhibits);
      }
    });
  })

  .post((request, response) => {
    user.findOne({}, function (err, user_) {
      if (user_.session_id !== request.headers.authorization) {
        return response.status(401).json({'message': 'unauthorized'})
      } else {
        const body = request.body;
        exhibit.find({exposition: body.exposition, code: body.code, active: true}, (error, exhibits) => {
          if (error) {
            logger.error(error);
            response.status(500).send(error);
          } else if (exhibits.length > 0 && body.active === true) {
            response.status(500).send({'error_code': '13'});
          } else {
            exhibit.create(request.body, (error, exhibit) => {
              if (error) {
                console.log(error);
                response.status(500).send(error);
              } else {
                response.status(201).json(exhibit);
              }
            });
          }
        });
      }
    })
  });

router.route('/exhibit/:exhibit_id')

  .get((request, response) => {
    exhibit.findById(request.params.exhibit_id, (error, exhibit) => {
      if (error) {
        logger.error(error);
        response.status(500).send(error);
      } else if (exhibit) {
        response.status(200).json(exhibit);
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
        exhibit.findOneAndUpdate({_id: request.params.exhibit_id}, body, (error, exhibit) => {
          if (error) {
            logger.error(error);
            response.status(500).send(error);
          } else if (exhibit) {
            response.status(200).json(exhibit);
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
        old_code = 0;
        old_active = true;
        exhibit.findOne({_id: body._id}, (error, exhibit) => {
          if (error) {
            logger.error(error);
            response.status(500).send(error);
          } else {
            old_code = exhibit.code;
            old_active = exhibit.active;
            delete body._id;
          }
        }).then(
          function () {
            exhibit.find({exposition: body.exposition, code: body.code, active: true}, (error, exhibits) => {
              if (error) {
                console.log(error);
                response.status(500).send(error);
              } else if (
                // Anderes Exponat existiert mit dem code, der geändert wurde
                (exhibits.length > 0 && body.code !== old_code && body.active === true) ||
                // Anderes Exponat existiert mit dem alten code, darf nicht auf active gesetzt werden
                (exhibits.length > 0 && body.code === old_code && body.active === true && old_active === false)) {
                response.status(500).send({'error_code': '13'});
              } else {
                exhibit.findOneAndUpdate({_id: request.params.exhibit_id}, body, (error, exhibit) => {
                  if (error) {
                    console.log(error);
                    response.status(500).send(error);
                  } else if (exhibit) {
                    response.status(200).json(exhibit);
                  } else {
                    response.status(404).send();
                  }
                });
              }
            });
          }).catch(function () {
          console.log("Unbekannter Fehler");
        });
      }
    })
  })

  .delete(async (request, response) => {
    const exhibitId = request.params.exhibit_id;

    try {

      /* Authenticate */

      const u = await user.findOne({});

      if (u.session_id !== request.headers.authorization) {
        response.status(401).json({'message': 'unauthorized'});
        return;
      }

      /* Remove from DB. Invalid ID -> 404 Not Found */

      const exh = await exhibit.findByIdAndRemove(exhibitId);

      if (!exh) {
        logger.warning(`No exhibit with ID ${exhibitId}`);
        respnse.status(404).send();
        return;
      }

      /* Remove directory from file system. Send 200 OK */

      rimraf.sync(`uploads/${exhibitId}`);
      response.status(200).json(exh);

    } catch (error) {
      logger.error(error);
      response.status(500).send(error);
    }
  });

router.route('/exhibit/:exhibit_id/comment_like')

  .patch((request, response) => {
    const exhibitId = request.params.exhibit_id;
    const body = request.body;
    exhibit.findByIdAndUpdate(exhibitId, {comments: body.comments, likes: body.likes}, (error, exhibit) => {
        if (error) {
          logger.log(error);
          response.status(500).send(error);
        } else if (exhibit) {
          response.status(200).json(exhibit);
        } else {
          response.status(404).send();
        }
      });
  });

module.exports = router;
