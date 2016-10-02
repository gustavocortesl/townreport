(function () {
  
  angular
    .module('townReportApp')
    .controller('registerModalCtrl', registerModalCtrl);
  
  registerModalCtrl.$inject = ['$rootScope', '$uibModalInstance', '$location', 'authentication'];
  function registerModalCtrl($rootScope, $uibModalInstance, $location, authentication) {
    var vm = this;
    
    vm.pageHeader = {
      title: 'Create a new TownReport account'
    };
    
    vm.credentials = {
      name : "",
      email : "",
      password : "",
      password2 : ""
    };
    
    vm.returnPage = $location.search().page || '/';
    
    vm.onSubmit = function () {
      vm.formError = "";
      if (!vm.credentials.name || !vm.credentials.email || !vm.credentials.password || !vm.credentials.password2) {
        vm.formError = "All fields required, please try again";
        return false;
      } else if (vm.credentials.password !== vm.credentials.password2) {
        vm.formError = "Passwords must be the same, please try again";
        return false;
      } else {
        vm.doRegister();
      }
    };

    vm.doRegister = function() {
      vm.formError = "";
      authentication.register(vm.credentials)
      .error(function(err){
        vm.formError = err.message;
      })
      .then(function(){
        //$location.search('page', null);
        //$location.path(vm.returnPage);
        vm.modal.close();
      });
      return false;
    };
    
    vm.modal = {
      close : function (result) {
        $uibModalInstance.close(result);
        if (result === 'login') {
          $rootScope.$broadcast("loginRequest", "registerModal");
        }
      },
      cancel : function () {
        $uibModalInstance.dismiss('cancel');
      }      
    };
    
  }
  
})();