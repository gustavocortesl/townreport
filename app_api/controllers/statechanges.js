var mongoose = require('mongoose');
var Problem = mongoose.model('Problem');
var User = mongoose.model('User');

// utility function that accepts response object,
// a status code, and a data object
var sendJSONresponse = function(res, status, content) {
  // send response status code
  res.status(status);
  // send response data, such as {“somekey” : “somevalue”}
  res.json(content);
};

module.exports.stateChangesCreate = function (req, res) {
  getAuthor(req, res, function (req, res, userName) {
    var problemid = req.params.problemid;
    if (problemid) {
      Problem
        .findById(problemid)
        .select('stateChanges')
        .exec(function(err, problem) {
          if (err) {
            sendJSONresponse(res, 400, err);
          } else {
            // successful find operation will call new function to
            // add state change, passing request, response, and problem objects
            doAddStateChange(req, res, problem, userName);
          }
        });
    } else {
      sendJSONresponse(res, 404, {
        "message": "Not found, problemid required"
      });
    }
  });
};

var getAuthor = function(req, res, callback) {
  // validate that JWT information is on request object
  if (req.payload && req.payload.email) {
    // use email address to find user
    User
      .findOne({ email : req.payload.email })
      .exec(function(err, user) {
      if (!user) {
        sendJSONresponse(res, 404, {
          "message": "User not found"
        });
        return;
      } else if (err) {
        console.log(err);
        sendJSONresponse(res, 404, err);
        return;
      }
      // run callback, passing user’s name
      callback(req, res, user.name);
    });
  } else {
    sendJSONresponse(res, 404, {
      "message": "User not found"
    });
    return;
  }
};

var doAddStateChange = function(req, res, problem, author) {
  console.log("problem before", problem);
  if (!problem) {
    sendJSONresponse(res, 404, "problem not found");
  } else {
    // when provided with a parent document
    // push new data into subdocument array
    problem.stateChanges.push({
      author: author,
      state: req.body.state,
      commentText: req.body.commentText
    });
    console.log("problem before", problem);
    problem.save(function(err, problem) {
      var thisStateChange;
      if (err) {
        sendJSONresponse(res, 400, err);
      } else {
        // Retrieve last state change added to array and 
        // return it as JSON confirmation response
        thisStateChange = problem.stateChanges[problem.stateChanges.length - 1];
        sendJSONresponse(res, 201, thisStateChange);
      }
    });
  }
};

module.exports.stateChangesReadOne = function (req, res) {
  if (req.params && req.params.problemid && req.params.statechangeid) {
    Loc
      .findById(req.params.problemid)
      .select('name stateChanges')
      .exec(function(err, problem) {
        var response, stateChange;
        if (!problem) {
          sendJSONresponse(res, 404, {
            "message": "problemid not found"
          });
          return;
        } else if (err) {
          // Error trap 3: if Mongoose returned an error, send it
          //               as 404 response and exit controller
          //               using return statement
          console.log(err);
          sendJSONresponse(res, 400, err);
          return;
        }
        if (problem.stateChanges && problem.stateChanges.length > 0) {
          stateChange = problem.comments.id(req.params.statechangeid);
          //console.log(stateChange);
          if (!stateChange) {
            sendJSONresponse(res, 404, {
              "message": "statechangeid not found"
            });
          } else {
            response = {
              problem : {
                name : problem.name,
                id : req.params.problemid
              },
              stateChange : stateChange
            };
            sendJSONresponse(res, 200, response);
          }
        } else {
          sendJSONresponse(res, 404, {
            "message": "No state changes found"
          });
        }
      }
    );
  } else {
    sendJSONresponse(res, 404, {
      "message": "Not found, problemid and statechangeid are both required"
    });
  }
};

module.exports.stateChangesUpdateOne = function (req, res) {
  if (!req.params.problemid || !req.params.statechangeid) {
    sendJSONresponse(res, 404, {
      "message": "Not found, problemid and statechangeid are both required"
    });
    return;
  }
  Problem
    // find parent document
    .findById(req.params.problemid)
    .select('stateChanges')
    .exec(
      function(err, problem) {
        var thisStateChange;
        if (!problem) {
          sendJSONresponse(res, 404, {
            "message": "problemid not found"
          });
          return;
        } else if (err) {
          sendJSONresponse(res, 400, err);
          return;
        }
        if (problem.stateChanges && problem.stateChanges.length > 0) {
          // find subdocument
          thisStateChange = problem.stateChanges.id(req.params.statechangeid);
          if (!thisStateChange) {
            sendJSONresponse(res, 404, {
              "message": "statechangeid not found"
            });
          } else {
            // make changes to subdocument from supplied form data
            thisStateChange.author = req.body.author;
            thisStateChange.state = req.body.state;
            thisStateChange.commentText = req.body.commentText;
            // save parent document and return a JSON response,
            // sending subdocument object on basis of successful save
            problem.save(function(err, problem) {
              if (err) {
                sendJSONresponse(res, 404, err);
              } else {
                sendJSONresponse(res, 200, thisStateChange);
              }
            });
          }
        } else {
          sendJSONresponse(res, 404, {
            "message": "No state change to update"
          });
        }
      }
  );
};

// app.delete('/api/problems/:problemid/comments/:statechangeid'
module.exports.stateChangesDeleteOne = function(req, res) {
  if (!req.params.problemid || !req.params.statechangeid) {
    sendJSONresponse(res, 404, {
      "message": "Not found, problemid and statechangeid are both required"
    });
    return;
  }
  Problem
    // find relevant parent document
    .findById(req.params.problemid)
    .select('stateChanges')
    .exec(
      function(err, problem) {
        if (!problem) {
          sendJSONresponse(res, 404, {
            "message": "problemid not found"
          });
          return;
        } else if (err) {
          sendJSONresponse(res, 400, err);
          return;
        }
        if (problem.stateChanges && problem.stateChanges.length > 0) {
          if (!problem.stateChanges.id(req.params.statechangeid)) {
            sendJSONresponse(res, 404, {
              "message": "statechangeid not found"
            });
          } else {
            // find and delete relevant subdocument in one step
            problem.stateChanges.id(req.params.statechangeid).remove();
            // save parent document and return appropriate
            // success or failure response
            problem.save(function(err) {
              if (err) {
                sendJSONresponse(res, 404, err);
              } else {
                sendJSONresponse(res, 204, null);
              }
            });
          }
        } else {
          sendJSONresponse(res, 404, {
            "message": "No state change to delete"
          });
        }
      }
  );
};
