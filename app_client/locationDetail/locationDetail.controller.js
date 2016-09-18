(function () {

  angular
    .module('townReportApp')
    .controller('locationDetailCtrl', locationDetailCtrl);

  //locationDetailCtrl.$inject = ['$routeParams', 'trData'];
  locationDetailCtrl.$inject = ['$routeParams', '$location', '$uibModal', 'trData', 'authentication'];
  //function locationDetailCtrl ($routeParams, trData) {
  function locationDetailCtrl ($routeParams, $location, $uibModal, trData, authentication) {
    var vm = this;
    vm.locationid = $routeParams.locationid;
    vm.pageHeader = {
      title: vm.locationid
    };
    
    trData.locationById(vm.locationid)
      .success(function(data) {
        vm.data = { location: data };
        //console.log('process.env',process.env);
        //vm.data.mapsKey = process.env.MAPS_KEY; // needed for map
        vm.pageHeader = {
          title: vm.data.location.name
        };
      })
      .error(function (e) {
        console.log(e);
        vm.message = "Sorry, something's gone wrong";
      });
    
    vm.isLoggedIn = authentication.isLoggedIn();

    vm.currentPath = $location.path();
    
    vm.popupReviewForm = function () {
      var modalInstance = $uibModal.open({
        templateUrl: '/reviewModal/reviewModal.view.html',
        controller: 'reviewModalCtrl as vm',
        resolve : {
          locationData : function () {
            return {
              locationid : vm.locationid,
              locationName : vm.data.location.name
            };
          }
        }
      });
      
      // when modal promise is resolved...
      modalInstance.result.then(function (data) {
        // push returned data into array of reviews
        vm.data.location.reviews.push(data);
      });
    }
  }
  
})();