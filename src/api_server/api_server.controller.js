angular.module('exzotron')
  .controller('ApiServerController', ['$scope', '$rootScope', 'ApiServerService', 'toaster',
    function ($scope, $rootScope, ApiServerService, toaster) {
      $scope.apiServers = [];
      $scope.selectedItem = null;
      $scope.newItem = {
        port: 80,
        timezone: 3,
        fuelPeriod: 10,
        countPeriod: 3
      };
      $scope.search = '';

      $rootScope.$watch('ui.search', function (newVal, oldVal) {
        if (newVal !== oldVal) {
          $scope.search = newVal;
        }
      }, true);

      $scope.getApiServers = function () {
        ApiServerService.get({}, function (result) {
          $scope.apiServers = result;
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.save = function () {
        ApiServerService.save($scope.selectedItem, function (result) {
          $scope.selectedItem = null;
          $scope.getApiServers();
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.delete = function (item) {
        ApiServerService.delete({'id': item.id}, function (result) {
          $scope.getApiServers();
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.edit = function (item) {
        $scope.selectedItem = angular.copy(item)
      };

      $scope.add = function () {
        ApiServerService.add($scope.newItem, function (result) {
          $scope.getApiServers();
          $scope.newItem = null;
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.cancel = function () {
        $scope.selectedItem = null;
      };

      $scope.getApiServerTypes = function () {
        ApiServerService.getApiServerTypes({}, function (result) {
          $scope.types = result;
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.testConnection = function (item) {
        item.testInProgress = true;
        ApiServerService.testConnection({'id': item.id}, function (result) {
          item.connectionSuccess = result;
          item.testInProgress = false;
          if (result.data) {
            item.apiCompanyId = result.data;
          }
        }, function (error) {
          item.testInProgress = false;
          item.connectionSuccess = false;
          toaster.pop('error', "", JSON.parse(error.data.data).message);
        });
      };

      $scope.setCurrentServer = function (item) {
        $rootScope.currentServer = item;
      };

      $scope.setActive = function (item) {
        ApiServerService.setActive({id: item.id, active: item.active}, function (result) {
          $scope.getApiServers();
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.getApiServers();
      $scope.getApiServerTypes();
    }]);
