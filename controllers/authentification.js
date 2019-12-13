const mongoose = require('mongoose');
const User = mongoose.model('User');

const sendJSONresponse = function (res, status, content) {
  res.status(status);
  res.json(content);
};

module.exports.register = function (req, res) {

  const user = new User();

  user.username = req.body.username;

  user.setPassword(req.body.password);

  user.setSession();

  user.save(function (err) {
    res.status(200);
    res.json({
      "token": user.generateJwt()
    });
  });

};

module.exports.update = function (req, res) {
  User.findOne({}, function (err, user) {
    if (err) return res.status(404).json(err);
    if (user.validPassword(req.body.username, req.body.password)) {
      user.username = req.body.newUsername;
      user.setPassword(req.body.newPassword);
      user.setSession();
    } else {
      res.status(404).json({ "message": "Wrong Data" })
    }
    user.save(function (err) {
      res.status(200);
      res.json({
        "token": user.generateJwt()
      });
    });
  });
};

module.exports.login = function (req, res) {
  User.findOne({}, function (err, _user) {
    let token;
    if (err) return res.status(404).json(err);
    if (!_user.validPassword(req.body.username, req.body.password)) {
      res.status(401).json({ "message": "Wrong crendentails" });
    } else {
      _user.setSession();
      _user.save();
      res.status(200);
      res.json({
        "token": _user.generateJwt()
      });
    }
  });

};
