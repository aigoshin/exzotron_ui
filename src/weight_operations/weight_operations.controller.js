angular.module('exzotron')
  .controller('WeightOperationsController', ['$scope', '$rootScope', '$location', 'toaster', 'WeightOperationsService', 'WeightOperationsLogService', 'VehicleService',
    function ($scope, $rootScope, $location, toaster, WeightOperationsService, WeightOperationsLogService, VehicleService) {
      $scope.operations = [];
      $scope.photos = [];
      $scope.selectedItem = null;
      $scope.newItem = null;
      $scope.search = '';
      $scope.weightOperationsLog = [];
      $scope.ui = {
        vehicles: []
      };

      $scope.toggleWeightMode = function (item) {
        if (!item || !item.id) return;
        let newMode = item.status === 'ENTRY' ? 'EXIT' : 'ENTRY';
        WeightOperationsLogService.toggleMode({
          id: item.id,
          mode: newMode,
          vehicleId: item.vehicleId
        }, function (result) {
          angular.extend(item, result);
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.edit = function (item) {
        $scope.selectedItem = angular.copy(item)
      };

      $scope.cancel = function () {
        $scope.selectedItem = null;
      };

      $scope.saveVehicle = function ($item, $model, selectedObject) {
        selectedObject.vehicleId = $item.id;
        if ($item.licensePlate) {
          selectedObject.plateNumber = $item.licensePlate;
        }
      }

      $scope.getVehicles = function (search) {
        if (!search) {
          $scope.ui.vehicles = $scope.ui.vehicles.concat([{id: 0, name: null}]);
          return;
        }
        VehicleService.get({search: search}, function (result) {
          $scope.ui.vehicles = result.map(function name(params) {
            return {id: params.id, name: params.name, imei: params.imei, licensePlate: params.licensePlate};
          });
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.saveLog = function (){
        WeightOperationsLogService.save($scope.selectedItem, function (result) {
          $scope.getWeightOperationsLog();
          $scope.selectedItem = null;
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      }

      $scope.toggleReport = function (item) {
        WeightOperationsLogService.toggleReport({id: item.id, enabled: !item.reportEnabled}, function (result) {
          $scope.getWeightOperationsLog();
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      }

      $scope.recalculate = function (item) {
        WeightOperationsLogService.recalculate({id: item.id}, function (result) {
          $scope.getWeightOperationsLog();
          toaster.pop('success', "", 'Пересчет завершен');
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      }

      $scope.$on('selectWeightOperation', function (event, data) {
        $scope.selectedWeightOperation = data.selectedWeightOperation;
        $scope.getWeightOperationsLog();
      });

      $rootScope.$watch('ui.search', function (newVal, oldVal) {
        if (newVal !== oldVal) {
          $scope.search = newVal;
        }
      }, true);

      $scope.getWeightOperationsLog = function () {
        $scope.photos = [];
        $scope.weightOperationsLog = [];
        const startDate = moment($rootScope.ui.dateFrom).format('YYYY-MM-DD HH:mm:ss');
        const endDate = moment($rootScope.ui.dateTo).format('YYYY-MM-DD HH:mm:ss');
        const weightbridgeId = $scope.selectedWeightOperation ? $scope.selectedWeightOperation.weightbridgeId : null;

        WeightOperationsLogService.get({weightbridgeId, startDate, endDate}, function (result) {
          $scope.weightOperationsLog = result;
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.save = function () {
        WeightOperationsService.save($scope.selectedItem, function (result) {
          $scope.selectedItem = null;
          $scope.getWeightOperations();
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.add = function () {
        WeightOperationsService.add($scope.newItem, function (result) {
          $scope.getWeightOperations();
          $scope.newItem = null;
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.selectLog = function (item){
        $scope.photoLoaded = false;
        $scope.currentItem = item;
        const weightingId = item.id;
        $scope.photos = [];
        WeightOperationsLogService.getPhotos({weightingId}, function (result) {
          $scope.photos = result;
          $scope.photoLoaded = true;
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      }

      $rootScope.$watch('ui.dateFrom', function (newVal, oldVal) {
        if ($scope.checkPath() && newVal !== oldVal) {
          $scope.getWeightOperationsLog();
        }
      }, true);

      $rootScope.$watch('ui.dateTo', function (newVal, oldVal) {
        if ($scope.checkPath() && newVal !== oldVal) {
          $scope.getWeightOperationsLog();
        }
      }, true);

      $scope.checkPath = function () {
        return $location.path() === '/weight_operations';
      }

      $scope.zoomedImage = null;

      $scope.toggleZoom = function(image) {
        if ($scope.zoomedImage === image) {
          $scope.zoomedImage = null;
        } else {
          $scope.zoomedImage = image;
        }
      };

      $scope.closeZoom = function() {
        $scope.zoomedImage = null;
      };

      $scope.getWeightOperationsLog();
    }]);
