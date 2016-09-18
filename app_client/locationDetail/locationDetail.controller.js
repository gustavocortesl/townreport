(function () {

  angular
    .module('loc8rApp')
    .controller('locationDetailCtrl', locationDetailCtrl);

  //locationDetailCtrl.$inject = ['$routeParams', 'loc8rData'];
  locationDetailCtrl.$inject = ['$routeParams', '$location', '$uibModal', 'loc8rData', 'authentication'];
  //function locationDetailCtrl ($routeParams, loc8rData) {
  function locationDetailCtrl ($routeParams, $location, $uibModal, loc8rData, authentication) {
    var vm = this;
    vm.mapsKey = process.env.MAPS_KEY;
    vm.locationid = $routeParams.locationid;
    vm.pageHeader = {
      title: vm.locationid
    };
    
    loc8rData.locationById(vm.locationid)
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