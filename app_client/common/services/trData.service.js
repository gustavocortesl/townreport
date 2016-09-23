(function () {

  angular
    .module('townReportApp')
    .service('trData', trData);

  trData.$inject = ['$http', 'authentication'];
  function trData ($http, authentication) {
    var problemsByCoords = function (lat, lng) {
      return $http.get('/api/problems?lng=' + lng + '&lat=' + lat + '&maxDistance=100');
    };
    
    var problemById = function (problemid) {
      return $http.get('/api/problems/' + problemid);
    };
    
    var addNewProblem = function (data) {
      return $http.post('/api/problems/', data, {
        headers: {
          Authorization: 'Bearer ' + authentication.getToken()
        }
      });
    };
    
    var addCommentById = function (problemid, data) {
      return $http.post('/api/problems/' + problemid + '/comments', data, {
        headers: {
          Authorization: 'Bearer ' + authentication.getToken()
        }
      });
    };
    
    var addStateChangeById = function (problemid, data) {
      return $http.post('/api/problems/' + problemid + '/statechanges', data, {
        headers: {
          Authorization: 'Bearer ' + authentication.getToken()
        }
      });
    };
    
    return {
      problemsByCoords : problemsByCoords,
      problemById : problemById,
      addNewProblem : addNewProblem,
      addCommentById : addCommentById,
      addStateChangeById : addStateChangeById
    };
  }
  
})();
