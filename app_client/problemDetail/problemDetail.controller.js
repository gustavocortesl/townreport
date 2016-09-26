(function () {

  angular
    .module('townReportApp')
    .controller('problemDetailCtrl', problemDetailCtrl);

  //locationDetailCtrl.$inject = ['$routeParams', 'trData'];
  problemDetailCtrl.$inject = ['$routeParams', '$location', '$uibModal', 'trData', 'authentication'];
  //function locationDetailCtrl ($routeParams, trData) {
  function problemDetailCtrl ($routeParams, $location, $uibModal, trData, authentication) {
    var vm = this;
    vm.problemid = $routeParams.problemid;
    vm.pageHeader = {
      title: vm.problemid
    };
    
    trData.problemById(vm.problemid)
      .success(function(data) {
        vm.data = { problem: data };
        //console.log('process.env',process.env);
        //vm.data.mapsKey = process.env.MAPS_KEY; // needed for map
        vm.data.mapsKey = "AIzaSyBzMA1nW7Yg65GNj6R3rlIV4Gjch0v8QlE";
        vm.pageHeader = {
          title: vm.data.problem.name
        };
      })
      .error(function (e) {
        console.log(e);
        vm.message = "Sorry, something's gone wrong";
      });
    
    vm.isLoggedIn = authentication.isLoggedIn();
    
    vm.isAdmin = authentication.isAdmin();

    vm.currentPath = $location.path();
    
    vm.popupCommentForm = function () {
      var modalInstance = $uibModal.open({
        templateUrl: '/commentModal/commentModal.view.html',
        controller: 'commentModalCtrl as vm',
        resolve : {
          problemData : function () {
            return {
              problemid : vm.problemid,
              problemName : vm.data.problem.name
            };
          }
        }
      });
      
      // when modal promise is resolved...
      modalInstance.result.then(function (data) {
        // push returned data into array of reviews
        vm.data.problem.comments.push(data);
      });
    }
    
    vm.popupStateChangeForm = function () {
      var modalInstance = $uibModal.open({
        templateUrl: '/stateChangeModal/stateChangeModal.view.html',
        controller: 'stateChangeModalCtrl as vm',
        resolve : {
          problemData : function () {
            return {
              problemid : vm.problemid,
              problemName : vm.data.problem.name,
              problemState : vm.data.problem.state
            };
          }
        }
      });
      
      // when modal promise is resolved...
      modalInstance.result.then(function (data) {
        // push returned data into array of reviews
        vm.data.problem.stateChanges.push(data);
        // update problem state
        trData.updateProblem(vm.problemid, { state: data.state })
        .success(function (data) {          
          vm.data.problem.state = data.state;
        })
        .error(function (data) {
          console.log("Error!");
          vm.formError = "Problem state has not been saved";
        });
        
      });
    }
    
  }
  
})();