angular.module('exzotron')
  .controller('VehicleController', ['$scope', '$rootScope', 'VehicleService', 'toaster', 'ApiServerService',
    function ($scope, $rootScope, VehicleService, toaster, ApiServerService) {
      $scope.vehicles = [];
      $scope.selectedItem = null;
      $scope.newItem = null;
      $scope.search = '';

      $scope.$on('updateCurrentDivision', function (event, data) {
        $scope.getVehicles();
      });

      $rootScope.$watch('ui.search', function (newVal, oldVal) {
        if (newVal !== oldVal) {
          $scope.search = newVal;
        }
      }, true);

      $scope.getVehicles = function () {
        VehicleService.get({}, function (result) {
          $scope.vehicles = result;
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.save = function () {
        VehicleService.save($scope.selectedItem, function (result) {
          $scope.selectedItem = null;
          $scope.getVehicles();
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.delete = function (item) {
        VehicleService.delete({'id': item.id}, function (result) {
          $scope.getVehicles();
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.edit = function (item) {
        $scope.selectedItem = angular.copy(item)
      };

      $scope.add = function () {
        VehicleService.add($scope.newItem, function (result) {
          $scope.getVehicles();
          $scope.newItem = null;
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.cancel = function () {
        $scope.selectedItem = null;
      }

      $scope.setTrueFuelControl = function (item) {
        VehicleService.setTrueFuelControl({id: item.id, trueFuelControl: item.trueFuelControl}, function (result) {
          $scope.getVehicles();
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.getApiServers = function () {
        ApiServerService.get({}, function (result) {
          $scope.servers = result;
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.setCurrentVehicle = function (item) {
        if (item.serverApiId) {
          $rootScope.currentVehicle = item;
        }
      };

      $scope.$on('vehicleSensorSelected', function (event, data) {
        $scope.getVehicles();
      });

      /*функция генерации уникальной строки для применения фильтрации директивы column-chooser*/
      $scope.fireFunc = function () {
        let json = {
          search: $scope.search,
          items: $scope.vehicles
        }
        return window.btoa(unescape(encodeURIComponent(JSON.stringify(json))));
      }

      $scope.getVehicles();
      $scope.getApiServers();
    }]);
