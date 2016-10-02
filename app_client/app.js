(function() {
  
  angular.module('townReportApp', ['ngRoute', 'ngSanitize', 'ui.bootstrap']);

  // config function to hold route definitions
  function config ($routeProvider, $locationProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'home/home.view.html',
        controller: 'homeCtrl',
        controllerAs: 'vm'
      })
      .when('/about', {
        templateUrl: '/common/views/genericText.view.html',
        controller: 'aboutCtrl',
        controllerAs: 'vm'
      })      
      .when('/contact', {
        templateUrl: '/common/views/genericText.view.html',
        controller: 'contactCtrl',
        controllerAs: 'vm'
      })
      .when('/problem/:problemid', {
        templateUrl: '/problemDetail/problemDetail.view.html',
        controller: 'problemDetailCtrl',
        controllerAs: 'vm'
      })
      .otherwise({
        redirectTo: '/'
      });
    
    // use the HTML5 History API
    $locationProvider.html5Mode(true);
  }

  angular
    .module('townReportApp')
    .config(['$routeProvider', '$locationProvider', config]);
  
})();
