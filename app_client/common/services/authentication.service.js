(function () {
  
  angular
    .module('townReportApp')
    .service('authentication', authentication);

  authentication.$inject = ['$http', '$window'];
  function authentication ($http, $window) {
    
    var saveToken = function (token) {
      $window.localStorage['townreport-token'] = token;
    };
    
    var getToken = function () {
      return $window.localStorage['townreport-token'];
    };
    
    var isLoggedIn = function() {
      var token = getToken();
      if (token) {
        var payload = JSON.parse($window.atob(token.split('.')[1]));
        return payload.exp > Date.now() / 1000;
      } else {
        return false;
      }
    };
    
    var isAdmin = function() {
      if (isLoggedIn()) {
        var token = getToken();
        var payload = JSON.parse($window.atob(token.split('.')[1]));
        return payload.admin;
      };
    };
    
    var currentUser = function() {
      if (isLoggedIn()) {
        var token = getToken();
        var payload = JSON.parse($window.atob(token.split('.')[1]));
        return {
          email : payload.email,
          name : payload.name,
          admin : payload.admin
        };
      }
    };
    
    var register = function(user) {
      return $http.post('/api/register', user).success(function(data){
        saveToken(data.token);
      });
    };

    var login = function(user) {
      return $http.post('/api/login', user).success(function(data) {
        saveToken(data.token);
      });
    };
    
    var logout = function() {
      $window.localStorage.removeItem('townreport-token');
    };
    
    return {
      saveToken : saveToken,
      getToken : getToken,
      isLoggedIn : isLoggedIn,
      isAdmin : isAdmin,
      currentUser : currentUser,
      register : register,
      login : login,
      logout : logout
    };
  }
  
})();