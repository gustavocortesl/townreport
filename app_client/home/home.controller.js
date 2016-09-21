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
            title: info.city
        });
        marker.content = '<div class="infoWindowContent">' + info.desc + '</div>';
        google.maps.event.addListener(marker, 'click', function(){
            infoWindow.setContent('<h3 class="info">' + marker.title + '</h3>' + marker.content);
            infoWindow.open($scope.map, marker);
        });
        
        $scope.markers.push(marker);
      
        return marker;
    }  
    /*
    for (i = 0; i < cities.length; i++){
        createMarker(cities[i]);
    }
    */
    $scope.openInfoWindow = function(e, selectedMarker){
        e.preventDefault();
        $scope.map.setZoom(19);
        google.maps.event.trigger(selectedMarker, 'click');
    }
    /*
    $scope.$watch("map", function (map) {
        if (map === undefined) {
            alert("map has no value");
        } else {
            alert("map is defined");
        }
    }, true);
    */
    vm.getData = function (position) {
      var lat = position.coords.latitude,
          lng = position.coords.longitude;
      $scope.map.setCenter(new google.maps.LatLng(lat, lng));
      vm.message = "Searching for nearby places";
      trData.locationByCoords(lat, lng)
        .success(function(data) {
          vm.message = data.length > 0 ? "" : "No locations found nearby";
          vm.data = { locations: data };
          for (i = 0; i < data.length; i++){
            data[i].marker = createMarker({
              lat: data[i].lat,
              long: data[i].lng,
              city: data[i].name,
              desc: data[i].address
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