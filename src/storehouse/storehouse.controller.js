angular.module('exzotron')
  .controller('StorehouseController', ['$scope', '$rootScope', 'StorehouseService', 'toaster', 'UserService',
    function ($scope, $rootScope, StorehouseService, toaster, UserService) {
      $scope.users = [];
      $scope.storehouses = [];
      $scope.selectedItem = null;
      $scope.newItem = null;
      $scope.search = '';

      $scope.$on('updateCurrentDivision', function (event, data) {
        $scope.getStorehouses();
      });

      $rootScope.$watch('ui.search', function (newVal, oldVal) {
        if (newVal !== oldVal) {
          $scope.search = newVal;
        }
      }, true);

      $scope.getStorehouses = function () {
        StorehouseService.get({}, function (result) {
          $scope.storehouses = result;
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.getUsersByCurrentCompany = function () {
        UserService.request.getUsersByCurrentCompany({}, function (result) {
          $scope.users = result;
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.save = function () {
        StorehouseService.save($scope.selectedItem, function (result) {
          $scope.getStorehouses();
          $scope.selectedItem = null;
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.delete = function (item) {
        StorehouseService.delete({'id': item.id}, function (result) {
          $scope.getStorehouses();
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.edit = function (item) {
        $scope.selectedItem = angular.copy(item)
      };

      $scope.add = function () {
        StorehouseService.add($scope.newItem, function (result) {
          $scope.getStorehouses();
          $scope.newItem = null;
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.cancel = function () {
        $scope.selectedItem = null;
      }

      $scope.setSensorExist = function (item) {
        StorehouseService.setSensorExist({id: item.id, sensorExists: item.sensorExists}, function (result) {
          $scope.getStorehouses();
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      }

      $scope.setTrueControl = function (item) {
        StorehouseService.setTrueControl({id: item.id, trueControl: item.trueControl}, function (result) {
          $scope.getStorehouses();
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      }

      $scope.getStorehouses();
      $scope.getUsersByCurrentCompany();
    }]);
