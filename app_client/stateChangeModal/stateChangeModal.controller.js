(function () {
  
  angular
    .module('townReportApp')
    .controller('stateChangeModalCtrl', stateChangeModalCtrl);

  stateChangeModalCtrl.$inject = ['$uibModalInstance', 'trData', 'problemData'];
  function stateChangeModalCtrl ($uibModalInstance, trData, problemData) {
    var vm = this;
    vm.problemData = problemData;

    vm.onSubmit = function () {
      vm.formError = "";
      if(!vm.formData || !vm.formData.state || !vm.formData.commentText) {
        vm.formError = "All fields required, please try again";
        return false;
      } else {
        vm.doAddStateChange(vm.problemData.problemid, vm.formData);
      }
    };
    
    vm.doAddStateChange = function (problemid, formData) {
      trData.addStateChangeById(problemid, {
        state : formData.state,
        commentText : formData.commentText
      })
        .success(function (data) {
          vm.modal.close(data);
        })
        .error(function (data) {
          console.log("Error!");
          vm.formError = "State change has not been saved, try again";
        });
      return false;
    };
    
    vm.modal = {
      close : function (result) {
        $uibModalInstance.close(result);
      },
      cancel : function () {
        $uibModalInstance.dismiss('cancel');
      }      
    };
  }
  
})();