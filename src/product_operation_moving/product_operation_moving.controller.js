angular.module('exzotron')
  .controller('ProductOperationMovingController', ['$scope', '$rootScope', 'ProductOperationService', 'toaster', '$location', 'FuelMovingService', 'ModalService',
    function ($scope, $rootScope, ProductOperationService, toaster, $location, FuelMovingService, ModalService) {
      $scope.items = [];

      $scope.getItems = function () {
        const startDate = moment($rootScope.ui.dateFrom).format('YYYY-MM-DD HH:mm:ss');
        const endDate = moment($rootScope.ui.dateTo).format('YYYY-MM-DD HH:mm:ss');
        FuelMovingService.get({startDate, endDate}, function (result) {
          $scope.items = result;
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.moveFuel = function (id) {
        let customOptions = {
          animation: false,
          templateUrl: 'static/src/tpl/move_fuel_modal.html',
          backdrop: 'static',
          windowClass: 'form-modal',
          size: 'lg',
          controller: ['$scope', '$uibModalInstance', '$rootScope', 'StorehouseService', 'TankService', 'FuelMovingService',
            function ($scope, $uibModalInstance, $rootScope, StorehouseService, TankService, FuelMovingService) {

            $scope.item = {
              dateTime: moment().format('YYYY-MM-DD HH:mm:ss'),
              count: 0
            };
            $scope.products = $rootScope.products;
            $scope.tanks = [];
            $scope.storehouses = [];
            $scope.onTimeSet = function (newDate, oldDate) {
              $scope.showDropdown = false;
            }
            $scope.getStorehouses = function () {
              StorehouseService.get({}, function (result) {
                $scope.storehouses = result;
              }, function (error) {
                toaster.pop('error', "", error.data.message);
              });
            };

            $scope.getTanks = function () {
              TankService.get({}, function (result) {
                $scope.tanks = result.filter(function (item) {
                  return item.visible;
                });
              }, function (error) {
                toaster.pop('error', "", error.data.message);
              });
            };

            $scope.getItem = function (){
              FuelMovingService.getById({id}, function (result) {
                $scope.item = result;
              }, function (error) {
                toaster.pop('error', "", error.data.message);
              });
            }

            $scope.ok = function (form) {
              if (form.$invalid) {
                return;
              }
              $uibModalInstance.close($scope.item);
            };

            $scope.cancel = function () {
              $uibModalInstance.dismiss();
            };

            $scope.getTanks();
            $scope.getStorehouses();
            if (id) {
              $scope.getItem();
            }
          }]
        };

        ModalService.showModal(customOptions, {}).then(function (result) {
          if (result) {
            FuelMovingService.add(result, function (result) {
              $scope.getItems();
            }, function (error) {
              toaster.pop('error', "", error.data.message);
            });
          }
        });
      };

      $scope.delete = function (item) {
        if (item.status !== 0) {
          return;
        }
        FuelMovingService.delete({id: item.id}, function (result) {
          $scope.getItems();
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.changeStatus = function (item) {
        FuelMovingService.changeStatus({id: item.id, status: item.status}, function (result) {
          $scope.getItems();
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      }

      $scope.$on('updateCurrentDivision', function (event, data) {
        $scope.getItems();
      });

      $rootScope.$watch('ui.dateFrom', function (newVal, oldVal) {
        if ($scope.checkPath() && newVal !== oldVal) {
          $scope.getItems();
        }
      }, true);

      $rootScope.$watch('ui.dateTo', function (newVal, oldVal) {
        if ($scope.checkPath() && newVal !== oldVal) {
          $scope.getItems();
        }
      }, true);

      $rootScope.$watch('currentUser.currentProductId', function (newVal, oldVal) {
        if ($scope.checkPath() && newVal !== oldVal) {
          $scope.getItems();
        }
      }, true);

      $scope.checkPath = function () {
        return $location.path() === '/fuel_moving';
      }

      $scope.getItems();
    }]);
