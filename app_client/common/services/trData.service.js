(function () {

  angular
    .module('townReportApp')
    .service('trData', trData);

  trData.$inject = ['$http', 'authentication'];
  function trData ($http, authentication) {
    var locationByCoords = function (lat, lng) {
      return $http.get('/api/locations?lng=' + lng + '&lat=' + lat + '&maxDistance=10');
    };
    
    var locationById = function (locationid) {
      return $http.get('/api/locations/' + locationid);
    };
    
    var addReviewById = function (locationid, data) {
      return $http.post('/api/locations/' + locationid + '/reviews', data, {
        headers: {
          Authorization: 'Bearer ' + authentication.getToken()
        }
      });
    };
    
    return {
      locationByCoords : locationByCoords,
      locationById : locationById,
      addReviewById : addReviewById
    };
  }
  
})();
