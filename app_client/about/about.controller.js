(function () {

  angular
    .module('townReportApp')
    .controller('aboutCtrl', aboutCtrl);
  
  function aboutCtrl() {
    var vm = this;
    vm.pageHeader = {
      title: 'About TownReport',
    };
    vm.main = {
      content: 'OUR MAIN GOAL: TO GET A BETTER PLACE TO LIVE\n\n' +      
      'TownReport has been created to help local government to know where the problems are. This is achieved with the cooperation of citizens which can report any issue (breakdowns, flaws, etc.) and so alert town maintenance services about it. Those responsible for the maintenance of public facilities can allocate resources and track the progress of works.\n\n' +
      'The problems to be considered are those related to basic town facilities that can be categorized (electrical-power, water-supply, traffic facilities…). Examples are:\n' + 
      '* An iron manhole cover that makes a noise when a vehicle passes over.\n' + 
      '* A streetlamp with a broken bulb.\n' +
      '* A public fountain without water.\n' +
      '* A swing in a playground broken or damaged.\n\n' +
      'FEATURES\n' +
      '- The website show in a map the location of registered problems.\n' +
      '- The website show in a list the main data of registered problems.\n' +
      '- The problems to show can be filtered by category, area, status, date, user…\n' +
      '- Every problem reported have a details page you can open by clicking/tapping on the map/list.\n' +
      '- Users will be classified into three categories: citizens, managers, and administrators.\n' +
      '- Citizens can register new problems and see the state of existing ones.\n' +
      '- Citizens can add comments or more information to any problem reported.\n' +
      '- Maintenance managers can do as citizens and also they can track the problems and change its state according to the progress of maintenance works.\n'
    };
  }
  
})();