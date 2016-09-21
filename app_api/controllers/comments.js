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

module.exports.commentsCreate = function (req, res) {
  getAuthor(req, res, function (req, res, userName) {
    var problemid = req.params.problemid;
    if (problemid) {
      Problem
        .findById(problemid)
        .select('comments')
        .exec(function(err, problem) {
          if (err) {
            sendJSONresponse(res, 400, err);
          } else {
            // successful find operation will call new function to
            // add comment, passing request, response, and problem objects
            doAddComment(req, res, problem, userName);
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

var doAddComment = function(req, res, problemid, author) {
  if (!problem) {
    sendJSONresponse(res, 404, "problemid not found");
  } else {
    // when provided with a parent document
    // push new data into subdocument array
    problem.comments.push({
      author: author,
      commentText: req.body.commentText
    });
    problem.save(function(err, problem) {
      var thisComment;
      if (err) {
        sendJSONresponse(res, 400, err);
      } else {
        // Retrieve last review added to array and 
        // return it as JSON confirmation response
        thisComment = problem.comments[problem.comments.length - 1];
        sendJSONresponse(res, 201, thisComment);
      }
    });
  }
};

module.exports.commentsReadOne = function (req, res) {
  if (req.params && req.params.problemid && req.params.commentid) {
    Loc
      .findById(req.params.problemid)
      .select('name comments')
      .exec(function(err, problem) {
        var response, comment;
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
        if (problem.comments && problem.comments.length > 0) {
          comment = problem.comments.id(req.params.commentid);
          //console.log(comment);
          if (!comment) {
            sendJSONresponse(res, 404, {
              "message": "commentid not found"
            });
          } else {
            response = {
              problem : {
                name : problem.name,
                id : req.params.problemid
              },
              comment : comment
            };
            sendJSONresponse(res, 200, response);
          }
        } else {
          sendJSONresponse(res, 404, {
            "message": "No comments found"
          });
        }
      }
    );
  } else {
    sendJSONresponse(res, 404, {
      "message": "Not found, problemid and commentid are both required"
    });
  }
};

module.exports.commentsUpdateOne = function (req, res) {
  if (!req.params.problemid || !req.params.commentid) {
    sendJSONresponse(res, 404, {
      "message": "Not found, problemid and commentid are both required"
    });
    return;
  }
  Problem
    // find parent document
    .findById(req.params.problemid)
    .select('comments')
    .exec(
      function(err, problem) {
        var thisComment;
        if (!problem) {
          sendJSONresponse(res, 404, {
            "message": "problemid not found"
          });
          return;
        } else if (err) {
          sendJSONresponse(res, 400, err);
          return;
        }
        if (problem.comments && problem.comments.length > 0) {
          // find subdocument
          thisComment = problem.comments.id(req.params.commentid);
          if (!thisComment) {
            sendJSONresponse(res, 404, {
              "message": "commentid not found"
            });
          } else {
            // make changes to subdocument from supplied form data
            thisComment.author = req.body.author;
            thisComment.commentText = req.body.commentText;
            // save parent document and return a JSON response,
            // sending subdocument object on basis of successful save
            problem.save(function(err, problem) {
              if (err) {
                sendJSONresponse(res, 404, err);
              } else {
                sendJSONresponse(res, 200, thisComment);
              }
            });
          }
        } else {
          sendJSONresponse(res, 404, {
            "message": "No comment to update"
          });
        }
      }
  );
};

// app.delete('/api/problems/:problemid/comments/:commentid'
module.exports.commentsDeleteOne = function(req, res) {
  if (!req.params.problemid || !req.params.commentid) {
    sendJSONresponse(res, 404, {
      "message": "Not found, problemid and commentid are both required"
    });
    return;
  }
  Problem
    // find relevant parent document
    .findById(req.params.problemid)
    .select('comments')
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
        if (problem.comments && problem.comments.length > 0) {
          if (!problem.comments.id(req.params.commentid)) {
            sendJSONresponse(res, 404, {
              "message": "commentid not found"
            });
          } else {
            // find and delete relevant subdocument in one step
            problem.comments.id(req.params.commentid).remove();
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
            "message": "No comment to delete"
          });
        }
      }
  );
};
