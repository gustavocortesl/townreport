(function () {
  
  angular
    .module('townReportApp')
    .controller('commentModalCtrl', commentModalCtrl);

  commentModalCtrl.$inject = ['$uibModalInstance', 'trData', 'problemData'];
  function commentModalCtrl ($uibModalInstance, trData, problemData) {
    var vm = this;
    vm.problemData = problemData;

    vm.onSubmit = function () {
      vm.formError = "";
      if(!vm.formData || !vm.formData.commentText) {
        vm.formError = "Comment text is required, please try again";
        return false;
      } else {
        vm.doAddComment(vm.problemData.problemid, vm.formData);
      }
    };
    
    vm.doAddComment = function (problemid, formData) {
      trData.addCommentById(problemid, {
        commentText : formData.commentText
      })
        .success(function (data) {
          vm.modal.close(data);
        })
        .error(function (data) {
          console.log("Error!");
          vm.formError = "Your comment has not been saved, try again";
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