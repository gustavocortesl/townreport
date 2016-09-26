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
    
    var addNewProblem = function (data) {
      return $http.post('/api/problems/', data, {
        headers: {
          Authorization: 'Bearer ' + authentication.getToken()
        }
      });
    };
    
    var updateProblem = function (problemid, data) {
      return $http.put('/api/problems/' + problemid, data, {
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
    
    var getVarValue = function (varName) {
      return $http.get('/api/config?var=' + varName);
    };
    
    return {
      problemsByCoords : problemsByCoords,
      problemById : problemById,
      addNewProblem : addNewProblem,
      updateProblem : updateProblem,
      addCommentById : addCommentById,
      addStateChangeById : addStateChangeById,
      getVarValue : getVarValue
    };
  }
  
})();
