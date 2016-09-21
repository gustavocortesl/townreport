(function () {

  /* global angular */
  angular
    .module('townReportApp')
    .filter('customSearch', customSearch);

  function customSearch () {
    // Create the return function and set the required parameter name to **input**
    return function (items, text) {
      var filtered = [];
      
      if (typeof text === undefined || text === "") return items;
      
      var regex = new RegExp(text, "i");
      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        if (regex.test(item.name) || regex.test(item.address)) {
          filtered.push(item);
        }
      }
      
      return filtered;      
    };
  }
  
})();