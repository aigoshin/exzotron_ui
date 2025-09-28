angular.module('exzotron')
  .controller('TankController', ['$scope', '$rootScope', 'TankService', 'toaster', 'StorehouseService', 'DivisionService', 'ObjectService',
    function ($scope, $rootScope, TankService, toaster, StorehouseService, DivisionService, ObjectService) {
      $scope.tanks = [];
      $scope.storehouses = [];
      $scope.divisions = [];
      $scope.objects = [];
      $rootScope.currentObject = null;
      $scope.search = '';

      $rootScope.$watch('ui.search', function (newVal, oldVal) {
        if (newVal !== oldVal) {
          $scope.search = newVal;
        }
      }, true);

      $scope.$on('updateCurrentDivision', function (event, data) {
        $scope.getTanks();
      });

      $scope.getTanks = function () {
        TankService.get({}, function (result) {
          $scope.tanks = result;
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.save = function () {
        TankService.save($scope.selectedItem, function (result) {
          $scope.getTanks();
          $scope.selectedItem = null;
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.delete = function (item) {
        TankService.delete({'id': item.id}, function (result) {
          $scope.getTanks();
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.edit = function (item) {
        $scope.selectedItem = angular.copy(item)
      };

      $scope.add = function () {
        TankService.add($scope.newItem, function (result) {
          $scope.getTanks();
          $scope.newItem = null;
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.cancel = function () {
        $scope.selectedItem = null;
      };

      $scope.getStorehouses = function () {
        StorehouseService.get({}, function (result) {
          $scope.storehouses = result;
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.getDivisions = function () {
        DivisionService.get({}, function (result) {
          $scope.divisions = result;
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.getStorehouses = function () {
        StorehouseService.get({}, function (result) {
          $scope.storehouses = result;
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.getObjects = function () {
        ObjectService.getObjects({}, function (result) {
          $scope.objects = result;
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.setCurrentObject = function (item) {
        $rootScope.currentObject = {id: item.id};
      };

      $scope.setVisible = function (item) {
        TankService.setVisible({id: item.id, visible: item.visible}, function (result) {
          $scope.getTanks();
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };


      $scope.$on('reloadTanks', function (event, data) {
        $scope.getTanks();
      });


      $scope.getStorehouses();
      $scope.getDivisions();
      $scope.getObjects();
      $scope.getTanks();
    }]);
