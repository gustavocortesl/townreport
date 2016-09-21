(function () {

  angular
    .module('townReportApp')
    .service('trData', trData);

  trData.$inject = ['$http', 'authentication'];
  function trData ($http, authentication) {
    var problemsByCoords = function (lat, lng) {
      return $http.get('/api/problems?lng=' + lng + '&lat=' + lat + '&maxDistance=10');
    };
    
    var problemById = function (problemid) {
      return $http.get('/api/problems/' + problemid);
    };
    
    var addCommentById = function (problemid, data) {
      return $http.post('/api/problems/' + locationid + '/comments', data, {
        headers: {
          Authorization: 'Bearer ' + authentication.getToken()
        }
      });
    };
    
    return {
      problemsByCoords : problemsByCoords,
      problemById : problemById,
      addCommentById : addCommentById
    };
  }
  
})();
