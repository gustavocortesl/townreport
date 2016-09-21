var mongoose = require('mongoose');
var Problem = mongoose.model('Problem');

var sendJSONresponse = function(res, status, content) {
  res.status(status);
  res.json(content);
};

var meterConversion = (function() {
    var mToKm = function(distance) {
        return parseFloat(distance / 1000);
    };
    var kmToM = function(distance) {
        return parseFloat(distance * 1000);
    };
    return {
        mToKm : mToKm,
        kmToM : kmToM
    };
})();

/* GET list of problems */
module.exports.problemsListByDistance = function(req, res) {
  var lng = parseFloat(req.query.lng);
  var lat = parseFloat(req.query.lat);
  var maxDistance = parseFloat(req.query.maxDistance);
  var point = {
    type: "Point",
    coordinates: [lng, lat]
  };
  var geoOptions = {
    spherical: true,
    //maxDistance: theEarth.getRadsFromDistance(maxDistance),
    maxDistance: meterConversion.kmToM(maxDistance),
    num: 10
  };
  // check lng and lat query parameters exist in right format;
  // return a 404 error and message if not
  if ((!lng && lng!==0) || (!lat && lat!==0) || !maxDistance) {
    console.log('problemsListByDistance missing params');
    sendJSONresponse(res, 404, {
      "message": "lng, lat and maxDistance query parameters are all required"
    });
    return;
  }
  
  Problem.geoNear(point, geoOptions, function(err, results, stats) {
    var problems;
    //console.log('Geo Results', results);
    //console.log('Geo stats', stats);
    if (err) {
      // if geoNear query returns error, send
      // this as response with 404 status
      console.log('geoNear error:', err);
      sendJSONresponse(res, 404, err);
    } else {
      problems = buildProblemList(req, res, results, stats);
      sendJSONresponse(res, 200, problems);
    }
  });
};

var buildProblemList = function(req, res, results, stats) {
  var problems = [];
  results.forEach(function(doc) {
    problems.push({
      distance: meterConversion.mToKm(doc.dis),
      lng: doc.obj.coords[0],
      lat: doc.obj.coords[1],
      author: doc.obj.author,
      name: doc.obj.name,
      category: doc.obj.category,
      state: doc.obj.state,
      description: doc.obj.description,
      address: doc.obj.address,
      priority: doc.obj.priority,
      _id: doc.obj._id
    });
  });
  return problems;
};

/* GET a problem by the id */
module.exports.problemsReadOne = function (req, res) {
  // Error trap 1: check that problemid exists
  //               in request parameters
  if (req.params && req.params.problemid) {
    Problem
      // get problemid from URL parameters
      .findById(req.params.problemid)
      // define callback to accept possible parameters
      .exec(function(err, problem) {
        // Error trap 2: if Mongoose doesn’t return a problem,
        //               send 404 message and exit function scope
        //               using return statement
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
          sendJSONresponse(res, 404, err);
          return;
        }
        // if Mongoose didn’t error, continue as before
        // and send problem object in a 200 response
        console.log(problem);
        sendJSONresponse(res, 200, problem);
      });
  } else {
    // if request parameters didn’t include problemid,
    // send appropriate 404 response
    console.log('No problemid specified');
    sendJSONresponse(res, 404, {
      "message": "No problemid in request"
    });
  }
};

/* POST a new problem */
/* /api/problems */
module.exports.problemsCreate = function(req, res) {
  console.log(req.body);
  // apply create method to model
  Problem.create({
    author: req.body.author,
    name: req.body.name,
    category: req.body.category,
    state: req.body.state,
    description: req.body.description,
    address: req.body.address,
    priority: req.body.priority,
    // parse coordinates from strings to numbers
    coords: [parseFloat(req.body.lng), parseFloat(req.body.lat)],
    comments: [],
    stateChanges: [{
      author: req.body.author,
      state: req.body.state,
      commentText: 'New problem created',
      createdOn: new Date()
    }]
  }, function(err, problem) {
    // callback function, containing appropriate
    // responses for failure and success
    if (err) {
      console.log(err);
      sendJSONresponse(res, 400, err);
    } else {
      console.log(problem);
      sendJSONresponse(res, 201, problem);
    }
  });
};

/* PUT /api/problems/:problemid */
module.exports.problemsUpdateOne = function(req, res) {
  if (!req.params.problemid) {
    sendJSONresponse(res, 404, {
      "message": "Not found, problemid is required"
    });
    return;
  }
  Problem
    // find problem document by supplied ID
    .findById(req.params.problemid)
    .select('-comments -stateChanges')
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
        // update paths with values from submitted form
        problem.author = req.body.author,
        problem.name = req.body.name;
        problem.category = req.body.category,
        problem.state = req.body.state,
        problem.description = req.body.description,
        problem.address = req.body.address;
        problem.priority = req.body.priority,
        problem.facilities = req.body.facilities.split(",");
        problem.coords = [parseFloat(req.body.lng), parseFloat(req.body.lat)];
        // save instance and send appropriate response,
        // depending on outcome of save operation
        problem.save(function(err, problem) {
          if (err) {
            sendJSONresponse(res, 404, err);
          } else {
            sendJSONresponse(res, 200, problem);
          }
        });
      }
  );
};

/* DELETE /api/problems/:problemid */
module.exports.problemsDeleteOne = function(req, res) {
  var problemid = req.params.problemid;
  if (problemid) {
    Problem
      // calling findByIdAndRemove, passing in problemid
      .findByIdAndRemove(problemid)
      // execute method and respond with success or failure
      .exec(function(err, problem) {
        if (err) {
          console.log(err);
          sendJSONresponse(res, 404, err);
          return;
        }
        console.log("Problem id " + problemid + " deleted");
        sendJSONresponse(res, 204, null);
      });
    /*
    // breaking it into a two-step process
    // and find it then delete it
    Problem
      .findById(problemid)
      .exec(function (err, problem) {
        // do something with the document
        Problem.remove(function(err, problem){
          // confirm success or failure
        });
      });
    */
  } else {
    sendJSONresponse(res, 404, {
      "message": "No lproblemid"
    });
  }
};
