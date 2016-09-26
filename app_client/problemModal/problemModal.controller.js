(function () {
  
  angular
    .module('townReportApp')
    .controller('problemModalCtrl', problemModalCtrl);

  problemModalCtrl.$inject = ['$uibModalInstance', 'trData', 'newProblemData'];
  function problemModalCtrl ($uibModalInstance, trData, newProblemData) {
    var vm = this;
    vm.newProblemData = newProblemData;
    
    vm.onSubmit = function () {
      vm.formError = "";
      if(!vm.formData || !vm.formData.name || !vm.formData.category || !vm.formData.state || !vm.formData.description) {
        vm.formError = "All fields required, please try again";
        return false;
      } else {
        vm.doAddProblem(vm.newProblemData, vm.formData);
      }
    };
    
    vm.doAddProblem = function (newProblemData, formData) {
      trData.addNewProblem({
        name : formData.name,
        category : formData.category,
        state : formData.state,
        description : formData.description,
        address : formData.address,
        priority : formData.priority,
        lng: newProblemData.lng,
        lat: newProblemData.lat
      })
        .success(function (data) {
          vm.modal.close(data);
        })
        .error(function (data) {
          console.log("Error!");
          vm.formError = "Your problem has not been saved, try again";
        });
      return false;
    };
    
    vm.modal = {
      close : function (result) {
        $uibModalInstance.close(result);
      },
      closeWithoutSave : function () {
        vm.newProblemData.newMarker.setAnimation(google.maps.Animation.BOUNCE);
        $uibModalInstance.dismiss('cancel')
      },
      cancel : function () {
        $uibModalInstance.dismiss('cancel');
        vm.newProblemData.deleteNewMarker();
      }      
    };
  }
  
})();