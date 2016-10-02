var sendJSONresponse = function(res, status, content) {
  res.status(status);
  res.json(content);
};

module.exports.configData = function(req, res) {
  // respond with an error status if required field are not found
  if(!req.body.var) {
    sendJSONresponse(res, 400, {
      "message": "Variable name required"
    });
    return;
  }
  
  // get variable value
  var value = process.env[req.body.var];
  if (!value) {
    sendJSONresponse(res, 404, "Variable not found or undefined.");
  } else {
    // generate a JWT using schema method and send it to browser
    sendJSONresponse(res, 200, {
      "value" : value
    });
  }
};