(function() {

  angular
    .module('townReportApp')
    .controller('homeCtrl', homeCtrl);

  homeCtrl.$inject = ['$scope', 'trData', 'geolocation'];
  function homeCtrl ($scope, trData, geolocation) {
    var vm = this;

    vm.pageHeader = {
      title: 'TownReport',
      strapline: 'Help local administration to know where the problems are!'
    };

    vm.sidebar = {
      content: "Looking for wifi and a seat? TownReport helps you find places to work when out and about. Perhaps with coffee, cake or a pint? Let TownReport help you find the place you're looking for."
    };

    vm.message = "Checking your location";
   
    var mapOptions = {
        zoom: 15,
        center: new google.maps.LatLng(36.74, -5.16),
        mapTypeId: google.maps.MapTypeId.TERRAIN
    }

    $scope.map = new google.maps.Map(document.getElementById('map'), mapOptions);
  
    $scope.markers = [];
    
    var infoWindow = new google.maps.InfoWindow();
    
    var createMarker = function (info){
        //console.log('info:',info);
        var marker = new google.maps.Marker({
            map: $scope.map,
            position: new google.maps.LatLng(info.lat, info.long),
            title: info.name,
            label: info.category.charAt(0)
        });
        marker.content = '<div class="infoWindowContent">'
                        + '<p>' + info.category + '</p>'              
                        + '<p>' + info.state + '</p>'
                        + '<p>' + info.desc + '</p>'
                        + '<p>' + info.address + '<p></div>';
        google.maps.event.addListener(marker, 'click', function(){
            infoWindow.setContent('<h4 class="info">' + marker.title + '</h4>' + marker.content);
            infoWindow.open($scope.map, marker);
        });
        
        $scope.markers.push(marker);
      
        return marker;
    }  
    
    $scope.openInfoWindow = function(e, selectedMarker){
        e.preventDefault();
        $scope.map.setZoom(19);
        google.maps.event.trigger(selectedMarker, 'click');
    }
    
    vm.getData = function (position) {
      var lat = position.coords.latitude,
          lng = position.coords.longitude;
      $scope.map.setCenter(new google.maps.LatLng(lat, lng));
      vm.message = "Searching for nearby problems";
      trData.problemsByCoords(lat, lng)
        .success(function(data) {
          vm.message = data.length > 0 ? "" : "No problems found nearby";
          vm.data = { problems: data };
          for (i = 0; i < data.length; i++){
            data[i].marker = createMarker({
              lat: data[i].lat,
              long: data[i].lng,
              name: data[i].name,
              category: data[i].category,
              state: data[i].state,
              desc: data[i].description,
              address: data[i].address
            });
          }
        })
        .error(function (e) {
          vm.message = "Sorry, something's gone wrong";
        });
    };

    vm.showError = function (error) {
      $scope.$apply(function() {
        vm.message = error.message;
      });
    };

    vm.noGeo = function () {
      $scope.$apply(function() {
        vm.message = "Geolocation is not supported by this browser.";
        $scope.map.setCenter(new google.maps.LatLng(36.74, -5.16));
      });
    };

    geolocation.getPosition(vm.getData, vm.showError, vm.noGeo);
  }
  
})();