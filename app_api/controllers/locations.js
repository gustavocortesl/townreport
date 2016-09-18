var mongoose = require('mongoose');
var Loc = mongoose.model('Location');

var sendJSONresponse = function(res, status, content) {
  res.status(status);
  res.json(content);
};

/* // this doesn't work when spherical is set to true
var theEarth = (function() {
  var earthRadius = 6371; // km, miles is 3959

  var getDistanceFromRads = function(rads) {
    return parseFloat(rads * earthRadius);
  };

  var getRadsFromDistance = function(distance) {
    return parseFloat(distance / earthRadius);
  };

  return {
    getDistanceFromRads: getDistanceFromRads,
    getRadsFromDistance: getRadsFromDistance
  };
})();
*/
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

/* GET list of locations */
module.exports.locationsListByDistance = function(req, res) {
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
    console.log('locationsListByDistance missing params');
    sendJSONresponse(res, 404, {
      "message": "lng, lat and maxDistance query parameters are all required"
    });
    return;
  }
  
  Loc.geoNear(point, geoOptions, function(err, results, stats) {
    var locations;
    console.log('Geo Results', results);
    console.log('Geo stats', stats);
    if (err) {
      // if geoNear query returns error, send
      // this as response with 404 status
      console.log('geoNear error:', err);
      sendJSONresponse(res, 404, err);
    } else {
      locations = buildLocationList(req, res, results, stats);
      sendJSONresponse(res, 200, locations);
    }
  });
};

var buildLocationList = function(req, res, results, stats) {
  var locations = [];
  results.forEach(function(doc) {
    locations.push({
      //distance: theEarth.getDistanceFromRads(doc.dis),
      distance: meterConversion.mToKm(doc.dis),
      name: doc.obj.name,
      address: doc.obj.address,
      rating: doc.obj.rating,
      facilities: doc.obj.facilities,
      _id: doc.obj._id
    });
  });
  return locations;
};

/* GET a location by the id */
module.exports.locationsReadOne = function (req, res) {
  // Error trap 1: check that locationid exists
  //               in request parameters
  if (req.params && req.params.locationid) {
    Loc
      // get locationid from URL parameters
      .findById(req.params.locationid)
      // define callback to accept possible parameters
      .exec(function(err, location) {
        // Error trap 2: if Mongoose doesn’t return a location,
        //               send 404 message and exit function scope
        //               using return statement
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
          sendJSONresponse(res, 404, err);
          return;
        }
        // if Mongoose didn’t error, continue as before
        // and send location object in a 200 response
        console.log(location);
        sendJSONresponse(res, 200, location);
      });
  } else {
    // if request parameters didn’t include locationid,
    // send appropriate 404 response
    console.log('No locationid specified');
    sendJSONresponse(res, 404, {
      "message": "No locationid in request"
    });
  }
};

/* POST a new location */
/* /api/locations */
module.exports.locationsCreate = function(req, res) {
  console.log(req.body);
  // apply create method to model
  Loc.create({
    name: req.body.name,
    address: req.body.address,
    // create array of facilities by splitting a comma-separated list
    facilities: req.body.facilities.split(","),
    // parse coordinates from strings to numbers
    coords: [parseFloat(req.body.lng), parseFloat(req.body.lat)],
    openingTimes: [{
      days: req.body.days1,
      opening: req.body.opening1,
      closing: req.body.closing1,
      closed: req.body.closed1,
    }, {
      days: req.body.days2,
      opening: req.body.opening2,
      closing: req.body.closing2,
      closed: req.body.closed2,
    }]
  }, function(err, location) {
    // callback function, containing appropriate
    // responses for failure and success
    if (err) {
      console.log(err);
      sendJSONresponse(res, 400, err);
    } else {
      console.log(location);
      sendJSONresponse(res, 201, location);
    }
  });
};

/* PUT /api/locations/:locationid */
module.exports.locationsUpdateOne = function(req, res) {
  if (!req.params.locationid) {
    sendJSONresponse(res, 404, {
      "message": "Not found, locationid is required"
    });
    return;
  }
  Loc
    // find location document by supplied ID
    .findById(req.params.locationid)
    .select('-reviews -rating')
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
        // update paths with values from submitted form
        location.name = req.body.name;
        location.address = req.body.address;
        location.facilities = req.body.facilities.split(",");
        location.coords = [parseFloat(req.body.lng), parseFloat(req.body.lat)];
        location.openingTimes = [{
          days: req.body.days1,
          opening: req.body.opening1,
          closing: req.body.closing1,
          closed: req.body.closed1,
        }, {
          days: req.body.days2,
          opening: req.body.opening2,
          closing: req.body.closing2,
          closed: req.body.closed2,
        }];
        // save instance and send appropriate response,
        // depending on outcome of save operation
        location.save(function(err, location) {
          if (err) {
            sendJSONresponse(res, 404, err);
          } else {
            sendJSONresponse(res, 200, location);
          }
        });
      }
  );
};

/* DELETE /api/locations/:locationid */
module.exports.locationsDeleteOne = function(req, res) {
  var locationid = req.params.locationid;
  if (locationid) {
    Loc
      // calling findByIdAndRemove, passing in locationid
      .findByIdAndRemove(locationid)
      // execute method and respond with success or failure
      .exec(function(err, location) {
        if (err) {
          console.log(err);
          sendJSONresponse(res, 404, err);
          return;
        }
        console.log("Location id " + locationid + " deleted");
        sendJSONresponse(res, 204, null);
      });
    /*
    // breaking it into a two-step process
    // and find it then delete it
    Loc
      .findById(locationid)
      .exec(function (err, location) {
        // do something with the document
        Loc.remove(function(err, location){
          // confirm success or failure
        });
      });
    */
  } else {
    sendJSONresponse(res, 404, {
      "message": "No locationid"
    });
  }
};
