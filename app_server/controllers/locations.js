var request = require('request');
var apiOptions = {
  // Default server URL for local development
  server : "http://localhost:3000"
};
if (process.env.NODE_ENV === 'production') {
  // if application running in production mode set different
  // base URL; change to be live address of application
  apiOptions.server = "https://blooming-chamber-56404.herokuapp.com";
}

var _isNumeric = function (n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
};

var _formatDistance = function (distance) {
  var numDistance, unit;
  if (distance && _isNumeric(distance)) {
    if (distance > 1) {
      // if supplied distance is over 1 km,
      // round to one decimal place and add km unit
      numDistance = parseFloat(distance).toFixed(1);
      unit = 'km';
    } else {
      // otherwise convert to meters and round
      // to nearest meter before adding m unit
      numDistance = parseInt(distance * 1000,10);
      unit = 'm';
    }
    return numDistance + unit;
  } else {
    return "?";
  }
};

var _showError = function (req, res, status) {
  var title, content;
  if (status === 404) {
    // if status passed through is 404, set title and content for page
    title = "404, page not found";
    content = "Oh dear. Looks like we can't find this page. Sorry.";
  } else if (status === 500) {
    // if status passed through is 500, set title and content for page
    title = "500, internal server error";
    content = "How embarrassing. There's a problem with our server.";
  } else {
    // otherwise set a generic catch-all message
    title = status + ", something's gone wrong";
    content = "Something, somewhere, has gone just a little bit wrong.";
  }
  // we use status parameter to set response status
  res.status(status);
  // send data to view to be compiled and sent to browser
  res.render('generic-text', {
    title : title,
    content : content
  });
};

var renderHomepage = function(req, res){
  res.render('locations-list', {
    title: 'Loc8r - find a place to work with wifi',
    pageHeader: {
      title: 'Loc8r',
      strapline: 'Find places to work with wifi near you!'
    },
    sidebar: "Looking for wifi and a seat? Loc8r helps you find places to work when out and about. Perhaps with coffee, cake or a pint? Let Loc8r help you find the place you're looking for."
  });
};

/* GET 'home' page */
module.exports.homelist = function (req, res, next) {
    renderHomepage(req, res);
};

var getLocationInfo = function (req, res, callback) {
  var requestOptions, path;
  path = "/api/locations/" + req.params.locationid;
  requestOptions = {
    url : apiOptions.server + path,
    method : "GET",
    json : {}
  };
  request(
    requestOptions,
    function(err, response, body) {
      var data = body;
      if (response.statusCode === 200) {
        data.coords = {
          lng : body.coords[0],
          lat : body.coords[1]
        };
        callback(req, res, data);
      } else {
        _showError(req, res, response.statusCode);
      }
    }
  );
};

var renderDetailPage = function (req, res, locDetail) {
  res.render('location-info', {
    title: locDetail.name,
    pageHeader: {title: locDetail.name},
    sidebar: {
      context: 'is on Loc8r because it has accessible wifi and space to sit down with your laptop and get some work done.',
      callToAction: 'If you\'ve been and you like it - or if you don\'t - please leave a review to help other people just like you.'
    },
    // pass full locDetail data object
    // to view, containing all details
    location: locDetail
  });
};
           
/* GET 'Location info' page */
module.exports.locationInfo = function(req, res){
  getLocationInfo(req, res, function (req, res, responseData) {
    renderDetailPage(req, res, responseData);
  });
};

var renderReviewForm = function (req, res, locDetail) {
  res.render('location-review-form', {
    title: 'Review ' + locDetail.name + ' on Loc8r',
    pageHeader: { title: 'Review ' + locDetail.name },
    // send new error variable to view, passing it query parameter when it exists
    error: req.query.err,
    url: req.originalUrl
  });
};

/* GET 'Add review' page */
module.exports.addReview = function(req, res){
  getLocationInfo(req, res, function (req, res, responseData) {
    renderReviewForm(req, res, responseData);
  });
};

module.exports.doAddReview = function(req, res){
  var requestOptions, path, locationid, postdata;
  // get location ID from URL to construct API URL
  locationid = req.params.locationid;
  path = "/api/locations/" + locationid + '/reviews';
  // create data object to send to API using submitted form data
  postdata = {
    author : req.body.name,
    rating : parseInt(req.body.rating, 10),
    reviewText : req.body.review
  };
  // set request options, including path, setting POST method
  // and passing submitted form data into json parameter
  requestOptions = {
    url : apiOptions.server + path,
    method : "POST",
    json : postdata
  };
  // if any of three required data fields are falsey, then redirect
  // to Add Review page, appending query string used to display error message
  if (!postdata.author || !postdata.rating || !postdata.reviewText) {
    res.redirect('/location/' + locationid + '/reviews/new?err=val');
  } else {
    // otherwise make the request
    request(requestOptions, function(err, response, body) {
      if (response.statusCode === 201) {
        // redirect to Details page if review was added successfully
        res.redirect('/location/' + locationid);
        // check to see if status is 400, if body has a name, and if that name is ValidationError
      } else if (response.statusCode === 400 && body.name && body.name === "ValidationError" ) {
        // if true redirect to review form, passing an error flag in query string
        res.redirect('/location/' + locationid + '/reviews/new?err=val');
      } else {
        console.log(body);
        // show an error page if API returned an error
        _showError(req, res, response.statusCode);
      }
    });
  }
};