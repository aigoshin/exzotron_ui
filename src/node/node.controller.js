angular.module('exzotron')
  .controller('NodeController', ['$scope', '$rootScope', 'NodeService', 'toaster', 'StorehouseService', 'DivisionService', 'ObjectService', 'TankSensorService',
    function ($scope, $rootScope, NodeService, toaster, StorehouseService, DivisionService, ObjectService, TankSensorService) {
      $scope.nodes = [];
      $scope.storehouses = [];
      $scope.divisions = [];
      $scope.objects = [];
      $scope.nodeTypes = [];
      $scope.counterTypes = [];
      $scope.sourceData = [];
      $scope.search = '';

      $scope.newItem = {
        nodeTypeId: 1,
        counterTypeId: 1,
        calibrationCounter: 100,
        tagIn: 229,
        tagTotal: 227,
        tagRfid: 228,
        tagRfidVehicle: 226
      };

      $scope.$on('updateCurrentDivision', function (event, data) {
        $scope.getNodes();
      });

      $rootScope.$watch('ui.search', function (newVal, oldVal) {
        if (newVal !== oldVal) {
          $scope.search = newVal;
        }
      }, true);

      $scope.getNodes = function () {
        NodeService.get({}, function (result) {
          $scope.nodes = result;
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.save = function () {
        NodeService.save($scope.selectedItem, function (result) {
          $scope.getNodes();
          $scope.selectedItem = null;
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.delete = function (item) {
        NodeService.delete({'id': item.id}, function (result) {
          $scope.getNodes();
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.edit = function (item) {
        $scope.selectedItem = angular.copy(item)
      };

      $scope.add = function () {
        NodeService.add($scope.newItem, function (result) {
          $scope.getNodes();
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

      $scope.getNodeTypes = function () {
        NodeService.getNodeTypes({}, function (result) {
          $scope.nodeTypes = result;
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.getCounterTypes = function () {
        NodeService.getCounterTypes({}, function (result) {
          $scope.counterTypes = result;
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.getSourceData = function () {
        TankSensorService.getSourceData({}, function (result) {
          $scope.sourceData = result;
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.setVisible = function (item) {
        NodeService.setVisible({id: item.id, visible: item.visible}, function (result) {
          $scope.getNodes();
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      }

      $scope.getStorehouses();
      $scope.getDivisions();
      $scope.getObjects();
      $scope.getNodeTypes();
      $scope.getCounterTypes();
      $scope.getSourceData();
      $scope.getNodes();
    }]);
