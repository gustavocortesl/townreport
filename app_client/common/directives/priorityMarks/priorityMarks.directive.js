(function() {
  
  angular
    .module('townReportApp')
    .directive('priorityMarks', priorityMarks);

  function priorityMarks () {
    return {
      restrict: 'EA',
      scope: {
        thisPriority : '=priority'
      },
      templateUrl: '/common/directives/priorityMarks/priorityMarks.template.html'
    };
  }

})();