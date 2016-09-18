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
      content: 'TownReport was created to help people report problems.\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc sed lorem ac nisi dignissim accumsan.\n\nNullam sit amet interdum magna. Morbi quis faucibus nisi. Vestibulum mollis purus quis eros adipiscing tristique.\n\nProin posuere semper tellus, id placerat augue dapibus ornare. Aenean leo metus, tempus in nisl eget, accumsan interdum dui.\n\nPellentesque sollicitudin volutpat ullamcorper.'
    };
  }
  
})();