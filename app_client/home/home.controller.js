(function() {

  angular
    .module('townReportApp')
    .controller('homeCtrl', homeCtrl);

  homeCtrl.$inject = ['$scope', '$location', '$uibModal', 'trData', 'geolocation', 'authentication'];
  function homeCtrl ($scope, $location, $uibModal, trData, geolocation, authentication) {
    var vm = this;
    
    vm.pageHeader = {
      title: 'TownReport',
      strapline: 'Help local administration to know where the problems are!'
    };

    vm.sidebar = {
      content: "Looking for wifi and a seat? TownReport helps you find places to work when out and about. Perhaps with coffee, cake or a pint? Let TownReport help you find the place you're looking for."
    };
    
    // MAP
    vm.lat = 36.74, // default map center latitude
    vm.lng = -5.16, // default map center longitude
  
    vm.newMarker = null;
    vm.showAlert = false;

    vm.message = "Checking your location";
   
    vm.isLoggedIn = authentication.isLoggedIn();

    vm.currentPath = $location.path();
    
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
        
        google.maps.event.addListener(marker, 'click', function () {
            infoWindow.setContent('<h4 class="info">' + marker.title + '</h4>' + marker.content);
            infoWindow.open($scope.map, marker);
        });
        
        $scope.markers.push(marker);
      
        return marker;
    }  
    
    vm.setNewMarker = function (position) {
      vm.showAlert = true;
      
      if (vm.newMarker) vm.deleteNewMarker();
      
      $scope.map.setCenter(new google.maps.LatLng(vm.lat, vm.lng));
      vm.newMarker = new google.maps.Marker({
            map: $scope.map,
            zoom: 18,
            position: new google.maps.LatLng(vm.lat, vm.lng),
            title: "To register a new Problem, drag this marker\nto the aproximate location and click on it",
            animation: google.maps.Animation.BOUNCE,
            draggable: true
        });
      
        google.maps.event.addListener(vm.newMarker, 'click', function () {
            vm.newMarker.setAnimation(null);
            vm.showAlert = false;  
            vm.popupProblemForm();
        });
        
        google.maps.event.addListener(vm.newMarker, 'drag', function () {
             vm.newMarker.setAnimation(null);
        });      
    }
    
    $scope.openInfoWindow = function(e, selectedMarker){
        e.preventDefault();
        $scope.map.setZoom(18);
        google.maps.event.trigger(selectedMarker, 'click');
    }
    
    vm.deleteNewMarker = function () {
      vm.newMarker.setMap(null);
      vm.newMarker = null;
    }
    
    vm.popupProblemForm = function () {
      var modalInstance = $uibModal.open({
        templateUrl: '/problemModal/problemModal.view.html',
        controller: 'problemModalCtrl as vm',
        resolve : {
          newProblemData : function () {
            return {
              lat : vm.newMarker.getPosition().lat(),
              lng : vm.newMarker.getPosition().lng(),
              newMarker : vm.newMarker,
              deleteNewMarker: vm.deleteNewMarker
            };
          }
        }
      });
      
      // when modal promise is resolved...
      modalInstance.result.then(function (data) {
        // delete 
        vm.deleteNewMarker();
        // add actual marker
        data.marker = createMarker({
          id: data._id,
          lat: data.lat,
          long: data.lng,
          name: data.name,
          category: data.category,
          state: data.state,
          desc: data.description,
          address: data.address
        });
        // push returned data into array
        vm.data.problems.push(data);
        console.log('new problem', data);
        console.log('new array', vm.data.problems)
      });
    }
    
    vm.getData = function (position) {
      vm.lat = position.coords.latitude,
      vm.lng = position.coords.longitude;
      $scope.map.setCenter(new google.maps.LatLng(vm.lat, vm.lng));
      vm.message = "Searching for nearby problems";
      trData.problemsByCoords(vm.lat, vm.lng)
        .success(function(data) {
          vm.message = data.length > 0 ? "" : "No problems found nearby";
          vm.data = { problems: data };
          for (i = 0; i < data.length; i++){
            data[i].marker = createMarker({
              id: data[i]._id,
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
        $scope.map.setCenter(new google.maps.LatLng(vm.lat, vm.lng));
      });
    };

    geolocation.getPosition(vm.getData, vm.showError, vm.noGeo);
  }
  
})();