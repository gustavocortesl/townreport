(function () {

  angular
    .module('townReportApp')
    .controller('loginModalCtrl', loginModalCtrl);
  
  loginModalCtrl.$inject = ['$rootScope', '$uibModalInstance', '$location', 'authentication'];
  function loginModalCtrl($rootScope, $uibModalInstance, $location, authentication) {
    var vm = this;
    
    vm.pageHeader = {
      title: 'User Login'
    };
    
    vm.credentials = {
      email : "",
      password : ""
    };
    
    vm.returnPage = $location.search().page || '/';
    
    vm.onSubmit = function () {
      vm.formError = "";
      if (!vm.credentials.email || !vm.credentials.password) {
        vm.formError = "All fields required, please try again";
        return false;
      } else {
        vm.doLogin();
      }
    };
  
    vm.doLogin = function() {
      vm.formError = "";
      authentication.login(vm.credentials)
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
        if (result === 'register') {
          $rootScope.$broadcast("registerRequest", "loginModal");
        }
      },
      cancel : function () {
        $uibModalInstance.dismiss('cancel');
      }      
    };
    
  }
  
})();