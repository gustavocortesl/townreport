(function () {
  
  angular
    .module('townReportApp')
    .controller('stateChangeModalCtrl', stateChangeModalCtrl);

  stateChangeModalCtrl.$inject = ['$uibModalInstance', 'trData', 'problemData'];
  function stateChangeModalCtrl ($uibModalInstance, trData, problemData) {
    var vm = this;
    
    vm.problemData = problemData;
    
    vm.stateOptions = [
      { name: "Rejected", active: false},
      { name: "New", active: false},
      { name: "Pending", active: false},
      { name: "Work in progress", active: false},
      { name: "Fixed", active: false}
    ]

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
        state : formData.state.name,
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
    
    vm.setStateOptions = function (state) {
      var states = ["Rejected", "New", "Pending", "Work in progress", "Fixed"];
      var position = states.indexOf(state);
      if (position === 0) {
        vm.stateOptions[1].active = true
      } else if (position === vm.stateOptions.length) {
        vm.stateOptions[vm.stateOptions.length - 2].active = true
      } else {
        vm.stateOptions[position - 1].active = true
        vm.stateOptions[position + 1].active = true
      }
    } 
    
    vm.setStateOptions(vm.problemData.problemState);
    
  }
  
})();