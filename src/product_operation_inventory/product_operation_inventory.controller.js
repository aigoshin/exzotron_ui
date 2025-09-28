angular.module('exzotron')
  .controller('ProductOperationInventoryController', ['$scope', '$rootScope', 'ProductOperationService', 'toaster', '$location', 'ModalService',
    function ($scope, $rootScope, ProductOperationService, toaster, $location, ModalService) {
      $scope.items = [];

      $scope.getItems = function () {
        const startDate = moment($rootScope.ui.dateFrom).format('YYYY-MM-DD HH:mm:ss');
        const endDate = moment($rootScope.ui.dateTo).format('YYYY-MM-DD HH:mm:ss');
        ProductOperationService.getInventory({startDate, endDate}, function (result) {
          $scope.items = result;
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.add = function () {
        let customOptions = {
          animation: false,
          templateUrl: 'static/src/tpl/add_product_inventory_item.html',
          backdrop: 'static',
          windowClass: 'form-modal',
          size: 'lg',
          controller: ['$scope', '$uibModalInstance', '$rootScope', 'StorehouseService', 'ProductOperationService',
            function ($scope, $uibModalInstance, $rootScope, StorehouseService, ProductOperationService) {
              $scope.item = {
                dateTime: moment().format('YYYY-MM-DD HH:mm:ss')
              };
              $scope.ui = {
                dateFromOpened: false,
                format: 'dd-MM-yy'
              }
              $scope.storehouses = [];
              $scope.onTimeSet = function (newDate, oldDate) {
                $scope.showDropdown = false;
                $scope.getBalance()
              }
              $scope.getStorehouses = function () {
                StorehouseService.get({}, function (result) {
                  $scope.storehouses = result;
                }, function (error) {
                  toaster.pop('error', "", error.data.message);
                });
              };

              $scope.getBalance = function () {
                if (!$scope.item.storehouseId || !$scope.item.dateTime) {
                  return;
                }
                $scope.balance = null;
                let storehouseId = $scope.item.storehouseId;
                let date = $scope.item.dateTime;
                ProductOperationService.getInventoryBalance({storehouseId, date}, function (result) {
                  $scope.balance = result;
                  $scope.item.actualBalance = result.actualBalance;
                  $scope.item.balanceSheet = result.balanceSheet;
                  $scope.item.residualDeviation = result.residualDeviation;
                }, function (error) {
                  toaster.pop('error', "", error.data.message);
                });
              }

              $scope.ok = function (form) {
                if (form.$invalid) {
                  return;
                }
                $scope.item.residualDeviation = $scope.item.actualBalance - $scope.item.balanceSheet
                $uibModalInstance.close($scope.item);
              };

              $scope.cancel = function () {
                $uibModalInstance.dismiss();
              };

              $scope.getStorehouses();
            }]
        };

        ModalService.showModal(customOptions, {}).then(function (result) {
          if (result) {
            ProductOperationService.saveInventory(result, function (result) {
              $scope.getItems();
            }, function (error) {
              toaster.pop('error', "", error.data.message);
            });
          }
        });
      };

      $scope.changeStatus = function (item) {
        let params = {
          id: item.id,
          status: item.status
        }

        ProductOperationService.setStatus(params, function (result) {
          $scope.getItems();
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      }

      $scope.delete = function (item){
        const id = item.id;
        ProductOperationService.deleteInventory({id}, function (result) {
          $scope.getItems();
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      }

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

      $scope.$on('updateCurrentDivision', function (event, data) {
        $scope.getItems();
      });

      $scope.checkPath = function () {
        return $location.path() === '/inventory';
      }

      $scope.getItems();
    }]);
