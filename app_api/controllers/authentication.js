var passport = require('passport');
var mongoose = require('mongoose');
var User = mongoose.model('User');

var sendJSONresponse = function(res, status, content) {
  res.status(status);
  res.json(content);
};

module.exports.register = function(req, res) {
  // respond with an error status if not all required fields are found
  if(!req.body.name || !req.body.email || !req.body.password) {
    sendJSONresponse(res, 400, {
      "message": "All fields required"
    });
    return;
  }
  
  // create a new user instance
  var user = new User();
  // set name and email
  user.name = req.body.name;
  user.email = req.body.email;
  // use setPassword method to set salt and hash
  user.setPassword(req.body.password);
  // Save new user to MongoDB
  user.save(function(err) {
    var token;
    if (err) {
      sendJSONresponse(res, 404, err);
    } else {
      token = user.generateJwt();
      // generate a JWT using schema method and send it to browser
      sendJSONresponse(res, 200, {
        "token" : token
      });
    }
  });
};

module.exports.login = function(req, res) {
  // validate that required fields have been supplied
  if(!req.body.email || !req.body.password) {
    sendJSONresponse(res, 400, {
      "message": "All fields required"
    });
    return;
  }
  
  // pass name of strategy and a callback to authenticate method
  passport.authenticate('local', function(err, user, info){
    var token;
    // return an error if Passport returns an error
    if (err) {
      sendJSONresponse(res, 404, err);
      return;
    }
    // if Passport returned a user instance, generate and send a JWT
    if(user){
      token = user.generateJwt();
      sendJSONresponse(res, 200, {
        "token" : token
      });
    } else {
      // otherwise return info message (why authentication failed)
      sendJSONresponse(res, 401, info);
    }
  })(req, res); //req and res must be available to Passport
};