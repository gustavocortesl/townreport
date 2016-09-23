(function () {

  angular
    .module('townReportApp')
    .controller('contactCtrl', contactCtrl);
  
  function contactCtrl() {
    var vm = this;
    vm.pageHeader = {
      title: 'Contact Us'
    };
    
    vm.main = {
      content: 'OUR ADDRESS\n' +
      'FSWD Capstone Projects\n' +
      'Muppala Avenue 2016\n' +
      '40029 Adnor\n' +
      'Agalam (THE CLOUDSLAND)\n\n' +      
      'PHONE NUMBERS\n' +      
      '899 989 989\n' +
      '899 987 014\n\n' +
      'FAX NUMBER\n' +
      '899 987 015\n\n' +
      'EMAIL\n' +
      'contact@fswdcp.com\n'
    };
  }
  
})();