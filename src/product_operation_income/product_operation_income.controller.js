angular.module('exzotron')
  .controller('ProductOperationIncomeController', ['$scope', '$rootScope', 'IncomeService', 'toaster', 'ModalService', 'PartnerService', 'TankService', '$location', 'StorehouseService',
    function ($scope, $rootScope, IncomeService, toaster, ModalService, PartnerService, TankService, $location, StorehouseService) {
      $scope.incomeLog = [];
      $scope.recipients = [];
      $scope.suppliers = [];
      $scope.tanks = [];
      $scope.storehouses = [];
      $scope.invoiseOperationType = [];
      $scope.inputsMap = {};

      $scope.setCurrentItem = function (item) {
        $scope.currentItem = item
      }

      $scope.showInput = function (column, show, item, $event) {
        $event.stopPropagation()
        if (item.status === 0) {
          $scope.inputsMap[column] = show;
        } else {
          toaster.pop('warning', "", "Нельзя редактировать, так как платежка уже проведена");
        }
      }

      $scope.saveLog = function (item) {
        IncomeService.save(item, function (result) {
          $scope.getIncomeLog();
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      }

      $scope.setTankLog = function (item) {

        if (!$scope.selected) {
          $scope.startClicked = item.logTime === item.transactionStartTime;
          $scope.endClicked = item.logTime === item.actualDate;
        } else if (item.logTime === item.actualDate) {
          $scope.endClicked = true;
          $scope.startClicked = false;
        } else if (item.logTime === item.transactionStartTime) {
          $scope.endClicked = false;
          $scope.startClicked = true;
        }


        if (($scope.startClicked || $scope.endClicked) && !$scope.selected) {
          $scope.selected = true;
          return;
        }

        item.start = $scope.startClicked;

        IncomeService.setTankLog(item, function (result) {
          $scope.getIncomeLog();
          if (item.start) {
            $scope.tankIncomeLogs.forEach(function (e){
              e.transactionStartTime = null;
            });
            item.transactionStartTime = moment(item.logTime).format('YYYY-MM-DD HH:mm:ss');
          }else {
            $scope.tankIncomeLogs.forEach(function (e){
              e.actualDate = null;
            });
            item.actualDate = moment(item.logTime).format('YYYY-MM-DD HH:mm:ss');
          }
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      }

      $scope.getTankIncomeLog = function (item) {
        if (!$scope.currentItem || $scope.currentItem.id !== item.id) return;
        $scope.startClicked = false;
        $scope.endClicked = false;
        $scope.selected = false;
        IncomeService.tankIncomeLog({id:item.id}, function (result) {
            $scope.tankIncomeLogs = result;
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      }

      $scope.getIncomeLog = function () {
        var startDate = moment($rootScope.ui.dateFrom).format('YYYY-MM-DD HH:mm:ss');
        var endDate = moment($rootScope.ui.dateTo).format('YYYY-MM-DD HH:mm:ss');
        IncomeService.get({startDate, endDate}, function (result) {
          $scope.incomeLog = result;
          if($scope.currentItem){
            $scope.currentItem = result.find(function (e){
              return e.id === $scope.currentItem.id;
            })
          }
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.getPartners = function () {
        PartnerService.get({}, function (result) {
          $scope.recipients = result.filter(function (item) {
            return item.typeId === 1;
          });
          $scope.suppliers = result.filter(function (item) {
            return item.typeId === 2;
          });
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

      $scope.showAddIncomeLogModal = function (item) {
        let customOptions = {
          animation: false,
          templateUrl: 'static/src/tpl/add_income_log_modal.html',
          backdrop: 'static',
          windowClass: 'form-modal',
          size: 'lg',
          resolve: {
            data: function () {
              return {
                item: item,
                recipients: $scope.recipients,
                suppliers: $scope.suppliers,
                products: $rootScope.products,
                tanks: $scope.tanks,
                storehouses: $scope.storehouses,
                invoiseOperationTypes: $scope.invoiseOperationTypes
              }
            }
          },
          controller: ['$scope', '$uibModalInstance', 'data', function ($scope, $uibModalInstance, data) {
            $scope.item = data.item;
            if (!$scope.item.actualDate) {
              $scope.item.actualDate = moment().format('YYYY-MM-DD HH:mm:ss');
            }
            if (!$scope.item.docDate) {
              $scope.item.docDate = moment().format('YYYY-MM-DD HH:mm:ss');
            }

            $scope.recipients = data.recipients;
            $scope.suppliers = data.suppliers;
            $scope.products = data.products;
            $scope.tanks = data.tanks;
            $scope.storehouses = [{id:null,name:null}].concat(data.storehouses);
            $scope.invoiseOperationTypes = data.invoiseOperationTypes;

            $scope.setInvoiceOperationType = function (item) {
              if (item) {
                $scope.item.invoiseOperationType = 4
              } else {
                $scope.item.invoiseOperationType = 1
              }
            }


            $scope.calculateDecrease = function () {
              if (!$scope.item || !$scope.item.densityDoc || !$scope.item.densityIn || !$scope.item.litresCounterDoc) return 0;
              $scope.item.sum = Math.abs(((($scope.item.densityDoc / $scope.item.densityIn) - 1)) * $scope.item.litresCounterDoc).toFixed(2);
            }

            $scope.onTimeSetDocDate = function (newDate, oldDate) {
              $scope.showDropdownDocDate = false;
            }

            $scope.onTimeSetActualDate = function (newDate, oldDate) {
              $scope.showDropdownActual = false;
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
          }]
        };

        ModalService.showModal(customOptions, {}).then(function (result) {
          if (result) {
            if (result.id) {
              $scope.saveLog(result);
            } else {
              IncomeService.add(result, function (result) {
                $scope.getIncomeLog();
              }, function (error) {
                toaster.pop('error', "", error.data.message);
              });
            }
          }
        });
      };

      $scope.addIncomeLog = function () {
        let item = {
          smoothing: 5,
          threshold: 1000,
          invoiseOperationType: 1,
          deliverySum: 0
        }
        $scope.showAddIncomeLogModal(item);
      };

      $scope.inputOpened = function () {
        if (Object.keys($scope.inputsMap).length === 0) {
          return false;
        }
        for (let [key, value] of $scope.inputsMap) {
          if (value) {
            return true;
          }
        }
        return false;
      }

      $scope.editIncomeLog = function (item) {
        if (item.status !== 0 && $scope.inputOpened()) {
          return;
        }
        IncomeService.getOne({id: item.id}, function (result) {
          $scope.showAddIncomeLogModal(result);
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.deleteIncomeLog = function (item) {
        if (item.status !== 0) {
          return;
        }
        IncomeService.delete({id: item.id}, function (result) {
          $scope.getIncomeLog();
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.changeStatus = function (item) {
        IncomeService.changeStatus({id: item.id, status: item.status}, function (result) {
          $scope.getIncomeLog();
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      }

      $scope.autogenerated = function (item) {
        IncomeService.autogenerated({id: item.id, autogenerated: item.autogenerated}, function (result) {
          $scope.getIncomeLog();
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      }

      $scope.checkPath = function () {
        return $location.path() === '/income';
      }

      $rootScope.$watch('ui.dateFrom', function (newVal, oldVal) {
        if ($scope.checkPath() && newVal !== oldVal && $scope.checkPath()) {
          $scope.getIncomeLog();
        }
      }, true);

      $rootScope.$watch('ui.dateTo', function (newVal, oldVal) {
        if ($scope.checkPath() && newVal !== oldVal && $scope.checkPath()) {
          $scope.getIncomeLog();
        }
      }, true);

      $scope.checkPath = function () {
        return $location.path() === '/fuel_income';
      };

      $scope.$on('getIncomes', function (event, data) {
        $scope.getIncomeLog();
      });

      $scope.$on('updateCurrentDivision', function (event, data) {
        $scope.getIncomeLog();
      });

      $scope.getStorehouses = function () {
        StorehouseService.get({}, function (result) {
          $scope.storehouses = result;
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.getInvoiseOperationTypes = function () {
        IncomeService.getInvoiseOperationTypes({}, function (result) {
          $scope.invoiseOperationTypes = result;
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };
      
      $scope.exportExcel = function () {
        var startDate = moment($rootScope.ui.dateFrom).format('YYYY-MM-DD HH:mm:ss');
        var endDate = moment($rootScope.ui.dateTo).format('YYYY-MM-DD HH:mm:ss');
        $rootScope.exportExcel('api/v1/income/export_excel?startDate=' + startDate + '&endDate=' + endDate, 'GET', {}, 'incomes.xlsx');
      };
      
      
      $scope.getIncomeLog();
      $scope.getPartners();
      $scope.getTanks();
      $scope.getStorehouses();
      $scope.getInvoiseOperationTypes();
    }]);
