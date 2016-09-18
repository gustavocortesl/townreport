var mongoose = require('mongoose');
var Loc = mongoose.model('Location');
var User = mongoose.model('User');

// utility function that accepts response object,
// a status code, and a data object
var sendJSONresponse = function(res, status, content) {
  // send response status code
  res.status(status);
  // send response data, such as {“somekey” : “somevalue”}
  res.json(content);
};

module.exports.reviewsCreate = function (req, res) {
  getAuthor(req, res, function (req, res, userName) {
    var locationid = req.params.locationid;
    if (locationid) {
      Loc
        .findById(locationid)
        .select('reviews')
        .exec(function(err, location) {
          if (err) {
            sendJSONresponse(res, 400, err);
          } else {
            // successful find operation will call new function to
            // add review, passing request, response, and location objects
            doAddReview(req, res, location, userName);
          }
        });
    } else {
      sendJSONresponse(res, 404, {
        "message": "Not found, locationid required"
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

var doAddReview = function(req, res, location, author) {
  if (!location) {
    sendJSONresponse(res, 404, "locationid not found");
  } else {
    // when provided with a parent document
    // push new data into subdocument array
    location.reviews.push({
      author: author,
      rating: req.body.rating,
      reviewText: req.body.reviewText
    });
    location.save(function(err, location) {
      var thisReview;
      if (err) {
        sendJSONresponse(res, 400, err);
      } else {
        // on successful save operation call function
        // to update average rating
        updateAverageRating(location._id);
        // Retrieve last review added to array and 
        // return it as JSON confirmation response
        thisReview = location.reviews[location.reviews.length - 1];
        sendJSONresponse(res, 201, thisReview);
      }
    });
  }
};

var updateAverageRating = function(locationid) {
  console.log("Update rating average for", locationid);
  Loc
    // find correct document given supplied ID
    .findById(locationid)
    .select('reviews')
    .exec(function(err, location) {
      if (!err) {
        doSetAverageRating(location);
      }
    });
};

var doSetAverageRating = function(location) {
  var i, reviewCount, ratingAverage, ratingTotal;
  if (location.reviews && location.reviews.length > 0) {
    reviewCount = location.reviews.length;
    ratingTotal = 0;
    // loop through review subdocuments adding up ratings
    for (i = 0; i < reviewCount; i++) {
      ratingTotal = ratingTotal + location.reviews[i].rating;
    }
    // calculate average rating value
    ratingAverage = parseInt(ratingTotal / reviewCount, 10);
    // update rating value of parent document
    location.rating = ratingAverage;
    // save parent document
    location.save(function(err) {
      if (err) {
        console.log(err);
      } else {
        console.log("Average rating updated to", ratingAverage);
      }
    });
  }
};

module.exports.reviewsReadOne = function (req, res) {
  if (req.params && req.params.locationid && req.params.reviewid) {
    Loc
      .findById(req.params.locationid)
      .select('name reviews')
      .exec(function(err, location) {
        var response, review;
        if (!location) {
          sendJSONresponse(res, 404, {
            "message": "locationid not found"
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
        if (location.reviews && location.reviews.length > 0) {
          review = location.reviews.id(req.params.reviewid);
          console.log(review);
          if (!review) {
            sendJSONresponse(res, 404, {
              "message": "reviewid not found"
            });
          } else {
            response = {
              location : {
                name : location.name,
                id : req.params.locationid
              },
              review : review
            };
            sendJSONresponse(res, 200, response);
          }
        } else {
          sendJSONresponse(res, 404, {
            "message": "No reviews found"
          });
        }
      }
    );
  } else {
    sendJSONresponse(res, 404, {
      "message": "Not found, locationid and reviewid are both required"
    });
  }
};

module.exports.reviewsUpdateOne = function (req, res) {
  if (!req.params.locationid || !req.params.reviewid) {
    sendJSONresponse(res, 404, {
      "message": "Not found, locationid and reviewid are both required"
    });
    return;
  }
  Loc
    // find parent document
    .findById(req.params.locationid)
    .select('reviews')
    .exec(
      function(err, location) {
        var thisReview;
        if (!location) {
          sendJSONresponse(res, 404, {
            "message": "locationid not found"
          });
          return;
        } else if (err) {
          sendJSONresponse(res, 400, err);
          return;
        }
        if (location.reviews && location.reviews.length > 0) {
          // find subdocument
          thisReview = location.reviews.id(req.params.reviewid);
          if (!thisReview) {
            sendJSONresponse(res, 404, {
              "message": "reviewid not found"
            });
          } else {
            // make changes to subdocument from supplied form data
            thisReview.author = req.body.author;
            thisReview.rating = req.body.rating;
            thisReview.reviewText = req.body.reviewText;
            // save parent document and return a JSON response,
            // sending subdocument object on basis of successful save
            location.save(function(err, location) {
              if (err) {
                sendJSONresponse(res, 404, err);
              } else {
                updateAverageRating(location._id);
                sendJSONresponse(res, 200, thisReview);
              }
            });
          }
        } else {
          sendJSONresponse(res, 404, {
            "message": "No review to update"
          });
        }
      }
  );
};

// app.delete('/api/locations/:locationid/reviews/:reviewid'
module.exports.reviewsDeleteOne = function(req, res) {
  if (!req.params.locationid || !req.params.reviewid) {
    sendJSONresponse(res, 404, {
      "message": "Not found, locationid and reviewid are both required"
    });
    return;
  }
  Loc
    // find relevant parent document
    .findById(req.params.locationid)
    .select('reviews')
    .exec(
      function(err, location) {
        if (!location) {
          sendJSONresponse(res, 404, {
            "message": "locationid not found"
          });
          return;
        } else if (err) {
          sendJSONresponse(res, 400, err);
          return;
        }
        if (location.reviews && location.reviews.length > 0) {
          if (!location.reviews.id(req.params.reviewid)) {
            sendJSONresponse(res, 404, {
              "message": "reviewid not found"
            });
          } else {
            // find and delete relevant subdocument in one step
            location.reviews.id(req.params.reviewid).remove();
            // save parent document and return appropriate
            // success or failure response
            location.save(function(err) {
              if (err) {
                sendJSONresponse(res, 404, err);
              } else {
                updateAverageRating(location._id);
                sendJSONresponse(res, 204, null);
              }
            });
          }
        } else {
          sendJSONresponse(res, 404, {
            "message": "No review to delete"
          });
        }
      }
  );
};
