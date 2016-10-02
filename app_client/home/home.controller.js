(function () {

  angular
    .module('townReportApp')
    .controller('homeCtrl', homeCtrl);

  homeCtrl.$inject = ['$rootScope', '$scope', '$filter', '$location', '$uibModal', 'trData', 'geolocation', 'authentication'];
  function homeCtrl($rootScope, $scope, $filter, $location, $uibModal, trData, geolocation, authentication) {
    var vm = this;
    
    vm.pageHeader = {
      title: 'TownReport',
      strapline: 'Help local administration to know where the problems are!'
    };
    
    vm.showAlert = false;
    vm.message = "Checking your location...";
    vm.isLoggedIn = authentication.isLoggedIn();
    vm.isAdmin = authentication.isAdmin();
    vm.currentPath = $location.path();

    // initialize tooltips
    $scope.$on('$viewContentLoaded', function()
    {
        $('[data-toggle="tooltip"]').tooltip();
    });
    
    // MAP DATA
    // Coordinates map center
    vm.lat = 36.74;   //36.74 default map center latitude
    vm.lng = -5.16;   //-5.16 default map center longitude
    var strictBounds = new google.maps.LatLngBounds(
      new google.maps.LatLng(36.72, -5.18), // SW
      new google.maps.LatLng(36.76, -5.14)  // NE
    );
    var mapOptions = {
        zoom: 15,
        center: new google.maps.LatLng(vm.lat, vm.lng),
        mapTypeId: google.maps.MapTypeId.TERRAIN,
        minZoom: 13,
        streetViewControl: false
      };   
    
    // map
    function initMap() {
      $scope.map = new google.maps.Map(document.getElementById('map'), mapOptions);

      $scope.heatmap = new google.maps.visualization.HeatmapLayer({
        data: [],
        map: null
      });

      // Listen for the dragend event
      google.maps.event.addListener($scope.map, 'dragend', function() {
        if (strictBounds.contains($scope.map.getCenter())) return;

        // We're out of bounds - Move the map back within the bounds
        var c = $scope.map.getCenter(),
            x = c.lng(),
            y = c.lat(),
            minX = strictBounds.getNorthEast().lng(),
            maxY = strictBounds.getNorthEast().lat(),
            maxX = strictBounds.getSouthWest().lng(),
            minY = strictBounds.getSouthWest().lat();

        if (x > minX) x = minX;
        if (x < maxX) x = maxX;
        if (y < minY) y = minY;
        if (y > maxY) y = maxY;

        $scope.map.setCenter(new google.maps.LatLng(y, x));
      });
    }
    /*
    trData.getVarValue({ var: "MAP_CENTER" })
      .success(function(data){
        vm.lat = data[0];
        vm.lng = data[1];
        // Bounds for map
        strictBounds = new google.maps.LatLngBounds(
          new google.maps.LatLng(vm.lat - 0.2, vm.lng + 0.2), // SW
          new google.maps.LatLng(vm.lat + 0.2, vm.lng - 0.2)  // NE
        );
        $scope.map.setCenter(new google.maps.LatLng(vm.lat, vm.lng));
      })
      .error(function (e) {
        vm.message = "Showing default map...";
      });
    */
    
    // Markers
    $scope.markers = [];
    vm.newMarker = null;
    
    var infoWindow = new google.maps.InfoWindow();
    
    var createMarker = function (info){
        //console.log('info:',info);
        var marker = new google.maps.Marker({
            map: $scope.map,
            position: new google.maps.LatLng(info.lat, info.lng),
            title: info.name,
            label: info.category.charAt(0)
        });
      
        marker.content = '<div class="infoWindowContent">'
                        + '<div><span class="label label-warning">' + info.category + '</span>'  
                        + '<span class="label label-warning">' + info.state + '</span>'
                        + '<p>' + info.desc + '<br>' + info.address + '</p>'
                        + '<p><small class="pull-right"><a href="/#/problem/' + info.id+ '">view details</a></small></p></div>';
        
        google.maps.event.addListener(marker, 'click', function () {
            infoWindow.setContent('<h4 class="info">' + marker.title + '</h4>' + marker.content);
            infoWindow.open($scope.map, marker);
        });
        
        $scope.markers.push(marker);
        //console.log('scope.marker', marker);
        return marker;
    }  
    
    vm.setNewMarker = function (position) {
      vm.showAlert = true;
      
      if (vm.newMarker) vm.deleteNewMarker();
      
      $scope.map.setCenter(new google.maps.LatLng(vm.lat, vm.lng));
      $scope.map.setZoom(17);
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
    
    // delete new marker
    vm.deleteNewMarker = function () {
      vm.newMarker.setMap(null);
      vm.newMarker = null;
    }
    
    // Sets the map on all markers in the array.
    vm.setMapOnAll = function(map) {
      for (var i = 0; i < $scope.markers.length; i++) {
        $scope.markers[i].setMap(map);
      }
    }
    
    // get coordinates
    vm.getPoints = function (markers) {
      var points = [];
      if (markers){
        markers.forEach(function (marker) {
            points.push(marker.position);            
        });
      }
      return points;
    }
    
    // show markers/heatmap
    vm.toggleHeatmap = function () {
      if ($scope.heatmap.getMap()) {
        $scope.heatmap.setMap(null);
        vm.setMapOnAll($scope.map);
      } else {
        vm.setMapOnAll(null);
        $scope.heatmap.setData(vm.getPoints($scope.markers));
        $scope.heatmap.setMap($scope.map);
      }
    }
    
    // login/logout done
    $scope.$on("login", function(data){
      console.log("login homepage", data);
      vm.isLoggedIn = authentication.isLoggedIn();
      vm.isAdmin = authentication.isAdmin();
    });
    
    // call for open modal login
    vm.callForLoginForm = function () {
      $rootScope.$broadcast("loginRequest", "homepage");
    }
    
    // open modal window to register problem
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
              deleteNewMarker: vm.deleteNewMarker,
              isAdmin: vm.isAdmin
            };
          }
        }
      });
      // when modal promise is resolved...
      modalInstance.result.then(function (data) {
        // delete new marker
        vm.deleteNewMarker();
        // and add actual marker
        data.marker = createMarker({
          id: data._id,
          lat: data.coords[1],
          lng: data.coords[0],
          name: data.name,
          category: data.category,
          state: data.state,
          desc: data.description,
          address: data.address,
          priority: data.priority
        });
        console.log('data.marker', data.marker);
        // push returned data into array
        vm.data.problems.push(data);
        google.maps.event.trigger($scope.map, 'resize');
        $scope.map.setZoom(15);
        console.log('new problem', data);
        //console.log('new array', vm.data.problems);
      });
    }
    
    // text filter
    $scope.$watch('textFilter', function(newValue, oldValue) {
      if (!newValue) return;
      var filtered = $filter('customSearch')(vm.data.problems, newValue);
      //console.log("filtered", filtered);
      vm.setMapOnAll(null);
      $scope.markers = [];
      for (var i = 0; i < filtered.length; i++) {
        $scope.markers.push(filtered[i].marker);
      }
      vm.setMapOnAll($scope.map);
    });
    
    vm.getData = function (position) {
      vm.lat = position.coords.latitude,
      vm.lng = position.coords.longitude;
      $scope.map.setCenter(new google.maps.LatLng(vm.lat, vm.lng));
      vm.message = "Searching for nearby problems...";
      trData.problemsByCoords(vm.lat, vm.lng)
        .success(function(data) {
          vm.message = data.length > 0 ? "" : "No problems found nearby";
          vm.data = { problems: data };
          for (i = 0; i < data.length; i++){
            data[i].marker = createMarker({
              id: data[i]._id,
              lat: data[i].lat,
              lng: data[i].lng,
              name: data[i].name,
              category: data[i].category,
              state: data[i].state,
              desc: data[i].description,
              address: data[i].address,
              priority: data[i].priority
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
  
    initMap();
  }
  
})();