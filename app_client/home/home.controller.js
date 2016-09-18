(function() {

  angular
    .module('townReportApp')
    .controller('homeCtrl', homeCtrl);

  homeCtrl.$inject = ['$scope', 'trData', 'geolocation'];
  function homeCtrl ($scope, trData, geolocation) {
    var vm = this;

    vm.pageHeader = {
      title: 'TownReport',
      strapline: 'Help local administration to know where the problems are!'
    };

    vm.sidebar = {
      content: "Looking for wifi and a seat? TownReport helps you find places to work when out and about. Perhaps with coffee, cake or a pint? Let Loc8r help you find the place you're looking for."
    };

    vm.message = "Checking your location";

    vm.getData = function (position) {
      var lat = position.coords.latitude,
          lng = position.coords.longitude;
      vm.message = "Searching for nearby places";
      trData.locationByCoords(lat, lng)
        .success(function(data) {
          vm.message = data.length > 0 ? "" : "No locations found nearby";
          vm.data = { locations: data };
        })
        .error(function (e) {
          vm.message = "Sorry, something's gone wrong";
        });
    };

    vm.showError = function (error) {
      $scope.$apply(function() {
        vm.message = error.message;
      });
    };

    vm.noGeo = function () {
      $scope.$apply(function() {
        vm.message = "Geolocation is not supported by this browser.";
      });
    };

    geolocation.getPosition(vm.getData, vm.showError, vm.noGeo);
  }
  
})();