angular.module('townReport', []);

var _isNumeric = function (n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
};

var formatDistance = function () {
  return function (distance) {
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
        numDistance = parseInt(distance * 1000, 10);
        unit = 'm';
      }
      return numDistance + unit;
    } else {
      return "?";
    }
  };
};

var ratingStars = function () {
  return {
    scope : {
      thisRating : "=rating" 
    },
    templateUrl: '/angular/rating-stars.html'
  };
};

var geolocation = function () {
  var getPosition = function (cbSuccess, cbError, cbNoGeo) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(cbSuccess, cbError);
    }
    else {
      cbNoGeo();
    }
  };
  return {
    getPosition : getPosition
  };
};

var trData = function ($http) {
  var locationByCoords = function (lat, lng) {
    return $http.get('/api/locations?lng=' + lng + '&lat=' + lat + '&maxDistance=20');
  };
  return {
    locationByCoords : locationByCoords
  };
};

var locationListCtrl = function ($scope, trData, geolocation) {
  $scope.message = "Checking your location";
  
  // if geolocation is successful
  $scope.getData = function (position) {
<<<<<<< HEAD
    console.log(position);
=======
>>>>>>> e8546366bce17a87c678da0cb050380cc9e2aa30
    var lat = position.coords.latitude,
        lng = position.coords.longitude;
    $scope.message = "Searching for nearby places";
    // invoke trData service, which returns $http.get call;
    // this runs ASYNCHRONOUSLY
    trData.locationByCoords(lat, lng)
      // on successful response, pass returned data into callback function
      .success(function(data) {
        $scope.message = data.length > 0 ? "" : "No locations found";
        // Apply this data to scope
        $scope.data = { locations: data };
      })
      // if web service returned error, pass error to callback function
      .error(function (e) {
        $scope.message = "Sorry, something's gone wrong ";
        console.log(e);
      });
  };
  
  // if geolocation is supported but not successful
  $scope.showError = function (error) {
    $scope.$apply(function() {
      $scope.message = error.message;
    });
  };
  
  // if geolocation isn’t supported by browser
  $scope.noGeo = function () {
    $scope.$apply(function() {
      $scope.message = "Geolocation not supported by this browser.";
    });
  };
  
  // Pass the function to geolocation service
  geolocation.getPosition($scope.getData, $scope.showError, $scope.noGeo);
};
  
angular
  .module('ltownReportApp')
  .controller('locationListCtrl', locationListCtrl)
  .filter('formatDistance', formatDistance)
  .directive('ratingStars', ratingStars)
  .service('trData', trData)
  .service('geolocation', geolocation);