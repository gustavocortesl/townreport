(function () {
  
  angular
    .module('townReportApp')
    .controller('reviewModalCtrl', reviewModalCtrl);

  reviewModalCtrl.$inject = ['$uibModalInstance', 'trData', 'locationData'];
  function reviewModalCtrl ($uibModalInstance, trData, locationData) {
    var vm = this;
    vm.locationData = locationData;

    vm.onSubmit = function () {
      vm.formError = "";
      if(!vm.formData || !vm.formData.rating || !vm.formData.reviewText) {
        vm.formError = "All fields required, please try again";
        return false;
      } else {
        vm.doAddReview(vm.locationData.locationid, vm.formData);
      }
    };
    
    vm.doAddReview = function (locationid, formData) {
      trData.addReviewById(locationid, {
        rating : formData.rating,
        reviewText : formData.reviewText
      })
        .success(function (data) {
          vm.modal.close(data);
        })
        .error(function (data) {
          console.log("Error!");
          vm.formError = "Your review has not been saved, try again";
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