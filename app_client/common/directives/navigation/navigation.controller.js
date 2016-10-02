(function () {
  
  angular
    .module('townReportApp')
    .controller('navigationCtrl', navigationCtrl);

  navigationCtrl.$inject = ['$rootScope', '$scope', '$location', '$uibModal', 'authentication'];
  function navigationCtrl($rootScope, $scope, $location, $uibModal, authentication) {
    var vm = this;
    
    vm.currentPath = $location.path();
    
    vm.isLoggedIn = authentication.isLoggedIn();
    
    vm.isAdmin = authentication.isAdmin();

    vm.currentUser = authentication.currentUser();

    // LOGOUT
    vm.logout = function() {
      authentication.logout();
      $location.path('/');
      $rootScope.$broadcast("login", "logout");
    };
    
    // LOGIN AND REGISTRATION
    $scope.$on("login", function(data) {
      console.log("login navbar", data);
      vm.isLoggedIn = authentication.isLoggedIn();
      vm.isAdmin = authentication.isAdmin();
      vm.currentUser = authentication.currentUser();
    });
    
    // DO LOGIN
    $scope.$on("loginRequest", function(data) {
      console.log("loginRequest", data);
      vm.popupLoginForm();
    });
    
    // open modal login
    vm.popupLoginForm = function () {
      var modalInstance = $uibModal.open({
        templateUrl: 'auth/loginModal/loginModal.view.html',
        controller: 'loginModalCtrl as vm'
      });
      // when modal promise is resolved...
      modalInstance.result.then(function (data) {
        $rootScope.$broadcast("login", "login");
      });
    }
    
    // DO REGISTRATION
    $scope.$on("registerRequest", function(data){
      console.log("registerRequest", data);
      vm.popupRegisterForm();
    });
    
    // open modal login
    vm.popupRegisterForm = function () {
      var modalInstance = $uibModal.open({
        templateUrl: 'auth/registerModal/registerModal.view.html',
        controller: 'registerModalCtrl as vm'
      });
      // when modal promise is resolved...
      modalInstance.result.then(function (data) {
        $rootScope.$broadcast("login", "login");
      });
    }
    
  }
  
})();