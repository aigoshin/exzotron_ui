angular.module('exzotron')
  .controller('BalanceController', ['$scope', '$rootScope', 'BalanceService', 'ModalService', 'toaster', 'AccountService', 'UserService', '$location', '$filter', '$window', 'VehicleService', '$timeout',
    function ($scope, $rootScope, BalanceService, ModalService, toaster, AccountService, UserService, $location, $filter, $window, VehicleService, $timeout) {
      $scope.search = '';
      $scope.dateFrom = $rootScope.ui.dateFrom;
      $scope.dateTo = $rootScope.ui.dateTo;
      $scope.accountOperations = [];
      $scope.groupByObjects = false;
      $scope.ui = {
        loaded: false,
        showVehicleSelectId: null
      }
      $scope.skipZero = true;

      $scope.balanceSplitPaneProperties = {};

      $scope.setFirstComponent = function (value) {
        $scope.balanceSplitPaneProperties.firstComponentSize = value;
      };
      $scope.setLastComponent = function (value) {
        $scope.balanceSplitPaneProperties.lastComponentSize = value;
      };

      $scope.setPaneProperties = function () {
        var firstComponentSize = $window.localStorage.getItem('balanceFirstComponentSize');
        var lastComponentSize = $window.localStorage.getItem('balanceLastComponentSize');
        if (firstComponentSize !== undefined && lastComponentSize !== undefined) {
          setTimeout(function () {
            $scope.balanceSplitPaneProperties = {
              firstComponentSize: firstComponentSize,
              lastComponentSize: lastComponentSize
            };
            $scope.balanceSplitPaneProperties.lastComponentSize = 0;
          });
        }
      };

      $scope.setPaneProperties();

      $scope.$watch('balanceSplitPaneProperties.firstComponentSize', function (newVal, oldVal) {
        if (newVal != oldVal) {
          setTimeout(function () {
            $window.localStorage.setItem('balanceFirstComponentSize', newVal);
          })
        }
      });

      $scope.$watch('balanceSplitPaneProperties.lastComponentSize', function (newVal, oldVal) {
        if (newVal != oldVal) {
          setTimeout(function () {
            $window.localStorage.setItem('balanceLastComponentSize', newVal);
          })
        }
      });

      $scope.newOperation = {
        rfid: null,
        count: 0,
        idUserTelegram: null,
        idProduct: null
      };

      $scope.showVehicleChart = false;

      function generateSeries(root, xAxis, yAxis, data, name, strokeWidth) {
        let series = am5xy.LineSeries.new(root, {
          name: name,
          xAxis: xAxis,
          yAxis: yAxis,
          valueYField: "value",
          valueXField: "date",
          legendValueText: "{valueY}",
          tooltip: am5.Tooltip.new(root, {
            pointerOrientation: "horizontal",
            labelText: "{valueY}"
          })
        });

        let formattedData = data.map(function (o) {
          return {date: new Date(o.label).getTime(), value: o.value};
        });

        series.data.setAll(formattedData);

        series.strokes.template.setAll({
          strokeWidth: strokeWidth
        })
        series.appear();
        return series;
      }

      $scope.getWialonData = function (item) {
        $scope.wialonReport = null;
        if (!item.operationLogId || !item.vehicleId) {
          return;
        }

        BalanceService.getWialonIncome({id: item.operationLogId}, function (result) {
          $scope.statData = result.statResult.reduce(function (map, obj) {
            map[obj.label] = obj.value;
            return map;
          }, {});
          $scope.wialonReport = result;

        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      }

      let root;

      $scope.showChart = function (item) {
        if (item && item.vehicleId && $scope.showBalanceChart) {
          $scope.chartItem = item;

          let params = {};
          if (item.dateTime) {
            params.startDate = item.dateTime;
          } else {
            params.startDate = moment($rootScope.ui.dateFrom).format('YYYY-MM-DD HH:mm:ss');
            params.endDate = moment($rootScope.ui.dateTo).format('YYYY-MM-DD HH:mm:ss');
          }
          params.vehicleId = item.vehicleId;
          params.skipZero = $scope.skipZero;
          $scope.showVehicleChart = false;
          $scope.getWialonData(item);
          BalanceService.getTankData(params, function (result) {
            if (!result || result.length < 1) {
              $scope.showVehicleChart = false;
              return;
            }
            $scope.vehicleName = item.vehicleName;
            $scope.credit = result.credits[result.credits.length - 1].value - result.credits[0].value;
            $scope.log = result.logs[result.logs.length - 1].value - result.logs[0].value;
            $scope.diff = $scope.log - $scope.credit;
            $scope.diffPct = $scope.diff / $scope.credit * 100;
            $scope.showVehicleChart = true;

            if (root) {
              root.dispose()
            }
            root = am5.Root.new("chartdiv");
            root.locale = am5locales_ru_RU;
            root.setThemes([
              am5themes_Animated.new(root)
            ]);

            const chart = root.container.children.push(am5xy.XYChart.new(root, {
              panX: true,
              panY: true,
              wheelX: "panX",
              wheelY: "zoomX",
              maxTooltipDistance: 0,
              pinchZoomX: true
            }));

            chart.get("colors").set("colors", [
              am5.color(0x6794dc),
              am5.color(0x50b300),
              am5.color(0xb30000),
              am5.color(0x7dd87d)
            ]);

            const xAxis = chart.xAxes.push(am5xy.DateAxis.new(root, {
              maxDeviation: 0.2,
              baseInterval: {
                timeUnit: "minute",
                count: 10
              },
              renderer: am5xy.AxisRendererX.new(root, {}),
              tooltip: am5.Tooltip.new(root, {})
            }));

            const yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
              renderer: am5xy.AxisRendererY.new(root, {})
            }));

            chart.series.push(generateSeries(root, xAxis, yAxis, result.sensor, 'Уровень', 3));
            chart.series.push(generateSeries(root, xAxis, yAxis, result.logs, 'Заправлено', 4));
            chart.series.push(generateSeries(root, xAxis, yAxis, result.credits, 'Выдано', 4));

            if (result.dart) {
              chart.series.push(generateSeries(root, xAxis, yAxis, result.dart, 'ДАРТ', 3));
            }

            chart.set("cursor", am5xy.XYCursor.new(root, {
              behavior: "none"
            }));

            chart.set("scrollbarX", am5.Scrollbar.new(root, {
              orientation: "horizontal"
            }));

            const legend = chart.bottomAxesContainer.children.push(am5.Legend.new(root, {
              layout: root.horizontalLayout,
              x: am5.percent(50),
              centerX: am5.percent(50),
              width: 500
            }));

            legend.itemContainers.template.events.on("pointerover", function (e) {
              const itemContainer = e.target;

              // As series list is data of a legend, dataContext is series
              const series = itemContainer.dataItem.dataContext;

              chart.series.each(function (chartSeries, idx) {
                if (chartSeries !== series) {
                  chartSeries.strokes.template.setAll({
                    strokeOpacity: 0.15,
                    stroke: am5.color(0x000000)
                  });
                } else {
                  chartSeries.strokes.template.setAll({
                    strokeWidth: idx === 0 ? 3 : 4,
                  });
                }
              })
            })

            legend.itemContainers.template.events.on("pointerout", function (e) {

              chart.series.each(function (chartSeries, idx) {
                chartSeries.strokes.template.setAll({
                  strokeOpacity: 1,
                  strokeWidth: idx === 0 ? 3 : 4,
                  stroke: chartSeries.get("fill")
                });
              });
            })

            legend.itemContainers.template.set("width", am5.p100);
            legend.valueLabels.template.setAll({
              width: am5.p100,
              textAlign: "left"
            });

            legend.data.setAll(chart.series.values);
            chart.appear(1000, 100);

          }, function (error) {
            toaster.pop('error', "", error.data.message);
          });
        }
      }

      $scope.exportChartData = function () {
        let params = {};
        let item = $scope.chartItem;

        if (item.dateTime) {
          params.startDate = item.dateTime;
        } else {
          params.startDate = moment($rootScope.ui.dateFrom).format('YYYY-MM-DD HH:mm:ss');
          params.endDate = moment($rootScope.ui.dateTo).format('YYYY-MM-DD HH:mm:ss');
        }
        params.vehicleId = item.vehicleId;

        $rootScope.exportExcel('api/v1/get_tank_data_excel?startDate=' + params.startDate +
          '&endDate=' + params.endDate + '&vehicleId=' + params.vehicleId + '&skipZero=' + $scope.skipZero,
          'GET', {}, 'tank_data.xls');
      }


      $scope.showBalanceChart = false;
      $scope.$on('showBalanceChart', function (event, data) {
        if (data.show) {
          $scope.showBalanceChart = true;
          var initialBalanceLastComponentSize = $window.localStorage.getItem('initialBalanceLastComponentSize');
          if (initialBalanceLastComponentSize <= 2) {
            initialBalanceLastComponentSize = 400;
          }
          $scope.setLastComponent(initialBalanceLastComponentSize);
        } else {
          $scope.showBalanceChart = false;
          const balanceLastComponentSize = $window.localStorage.getItem('balanceLastComponentSize');
          $window.localStorage.setItem('initialBalanceLastComponentSize', balanceLastComponentSize);
          $scope.setLastComponent(0);
        }
      });

      $scope.getAccountOperations = function () {
        if (root) {
          root.container.children.clear();
        }
        $scope.accountOperations = [];
        var startDate = moment($rootScope.ui.dateFrom).format('YYYY-MM-DD HH:mm:ss');
        var endDate = moment($rootScope.ui.dateTo).format('YYYY-MM-DD HH:mm:ss');
        var groupByObjects = $scope.groupByObjects;
        $scope.ui.loaded = false;

        BalanceService.getAccountOperations({startDate, endDate, groupByObjects}, function (result) {
          $scope.accountOperations = result;
          $scope.ui.loaded = true;
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      }

      $scope.selectAccountOperation = function (accountOperation) {
        $scope.selectedAccountOperation = accountOperation
        if (accountOperation.accountOperationId != $scope.ui.showVehicleSelectId) {
          $scope.ui.showVehicleSelectId = null;
        }

        $scope.showChart(accountOperation);
        if ($scope.groupByObjects) {
          $rootScope.$broadcast('selectAccountOperationByObject', {accountOperation: accountOperation});
          return;
        }
        $scope.newOperation.rfid = accountOperation.account
        // $rootScope.$broadcast('selectAccountOperation', {accountOperation: accountOperation});
      }

      $scope.$on('filterAccountOperations', function (event, data) {
        $scope.selectedRfidObject = data.selectedRfidObject;
        $scope.newOperation.rfid = $scope.selectedRfidObject && !$scope.groupByObjects ? $scope.selectedRfidObject.rfid : null;
      });

      $scope.$on('groupByObjects', function (event, data) {
        $scope.showVehicleChart = false;
        $scope.groupByObjects = data.groupByObjects;
        $scope.getAccountOperations();
      });

      $scope.skipZeroF = function (skipZero){
        $scope.skipZero = skipZero;
        $scope.showChart($scope.selectedAccountOperation);
      }

      $scope.filterByRfid = function (item) {
        if (!$scope.selectedRfidObject) {
          return true;
        }

        if ($scope.groupByObjects) {
          return $scope.selectedRfidObject.imei === item.imei;

        } else {
          return $scope.selectedRfidObject.rfid === item.account;
        }
      };

      $scope.moveCount = function () {
        AccountService.moveCount($scope.newOperation, function (result) {
          if (result.data.indexOf('Lock!!!') > -1) {
            toaster.pop('error', "", result.data);
          } else {
            $scope.newOperation.count = 0;
            toaster.pop('success', "", "Успешно");
            $scope.getAccountOperations();
          }
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      }

      $rootScope.$watch('ui.search', function (newVal, oldVal) {
        if (newVal !== oldVal) {
          $scope.search = newVal;
        }
      }, true);

      $scope.checkPath = function () {
        return $location.path() === '/balance';
      }

      $rootScope.$watch('ui.dateFrom', function (newVal, oldVal) {

        if ($scope.checkPath() &&
          moment(newVal).format('YYYY-MM-DD HH:mm') !== moment(oldVal).format('YYYY-MM-DD HH:mm')) {
          $scope.getAccountOperations();
        }
      }, true);

      $rootScope.$watch('ui.dateTo', function (newVal, oldVal) {
        if ($scope.checkPath() && newVal !== oldVal &&
          moment(newVal).format('YYYY-MM-DD HH:mm') !== moment(oldVal).format('YYYY-MM-DD HH:mm')) {
          $scope.getAccountOperations();
        }
      }, true);

      $rootScope.$watch('currentUser.currentProductId', function (newVal, oldVal) {
        if ($scope.checkPath() && newVal !== oldVal && $scope.checkPath()) {
          $scope.newOperation.idProduct = newVal;
          $scope.getAccountOperations();
        }
      }, true);

      $scope.checkPath = function () {
        return $location.path() === '/balance';
      };

      $scope.initNewOperation = function () {
        $scope.newOperation.idUserTelegram = UserService.storage.currentUser.telegram;
        $scope.newOperation.idProduct = UserService.storage.currentUser.currentProductId;
      }

      $rootScope.$on('updateCurrentPartner', function (event, data) {
        $scope.getAccountOperations();
      });

      $scope.getAccountOperations();

      $scope.showDvsInput = false;
      $scope.editConsumptionByDvs = function (wialonReport){
          $scope.showDvsInput = true;
          $scope.newDvsVal = wialonReport.consumptionByDvs;
      }

      $scope.saveVehicle = function ($item, $model, accountOperation) {
        BalanceService.setVehicleId({
          operationLogId: accountOperation.operationLogId,
          vehicleId: $item.id
        }, function (result) {
          $scope.ui.showVehicleSelectId = null;
          accountOperation.vehicleImei = $item.imei;
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      }


      $scope.showVehicleSelect = function (accountOperation) {
        $scope.ui.showVehicleSelectId = accountOperation.accountOperationId;
      }

      $scope.showVehicleModal = function (accountOperation) {
        if (!accountOperation.vehicleId) {
          return;
        }
        let customOptions = {
          animation: false,
          templateUrl: 'static/src/tpl/vehicle_modal.html',
          backdrop: 'static',
          windowClass: 'form-modal',
          size: 'lg',
          resolve: {
            data: function () {
              return {
                accountOperation: accountOperation
              }
            }
          },
          controller: ['$scope', '$uibModalInstance', 'data', 'VehicleService', function ($scope, $uibModalInstance, data, VehicleService) {
            $scope.accountOperation = data.accountOperation;
            $scope.vehicle = null;

            VehicleService.getById({vehicleId: $scope.accountOperation.vehicleId}, function (result) {
              $scope.vehicle = result;
            }, function (error) {
              toaster.pop('error', "", error.data.message);
            });

            $scope.ok = function (form) {
              if (form.$invalid) {
                return;
              }
              $uibModalInstance.close($scope.vehicle);
            };

            $scope.cancel = function () {
              $uibModalInstance.dismiss();
            };
          }]
        };

        ModalService.showModal(customOptions, {}).then(function (result) {
          if (result) {
            VehicleService.save(result, function (result) {
              toaster.pop('success', "", 'Успешно');
              accountOperation.vehicleImei = result.imei;
            }, function (error) {
              toaster.pop('error', "", error.data.message);
            });
          }
        });
      };

      $scope.ui.vehicles = [];
      $scope.getVehicles = function (search) {
        VehicleService.get({search: search}, function (result) {
          $scope.ui.vehicles = result.filter(function (item) {
            return item.imei;
          }).map(function name(params) {
            return {id: params.id, name: params.name, imei: params.imei};
          });
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.saveVehicleMultiplier = function (newDvsVal) {
        let multiplier = newDvsVal/$scope.wialonReport.consumptionByDvsOrig;
        console.log(multiplier + ' for vehicle ' + $scope.selectedAccountOperation.vehicleId);

        VehicleService.setVehicleMultiplier({
          id: $scope.selectedAccountOperation.vehicleId,
          multiplier: multiplier
        }, function (result) {
          $scope.revertMultiplierChanges();
          $scope.showChart($scope.selectedAccountOperation);
        }, function (error) {
          $scope.revertMultiplierChanges();
          toaster.pop('error', "", error.data.message);
        });
      }

      $scope.revertMultiplierChanges = function (){
        $scope.showDvsInput = false;
        $scope.newDvsVal = undefined;
      }

      $scope.setLoadApi = function (item) {
        if(item){
          item.inProgress = true;
        }else {
          $scope.accountOperations.forEach(function (item){
            item.inProgress = true;
          })
        }
        const startDate = moment($rootScope.ui.dateFrom).format('YYYY-MM-DD HH:mm:ss');
        const endDate = moment($rootScope.ui.dateTo).format('YYYY-MM-DD HH:mm:ss');

        BalanceService.setLoadApi({
          id: item ? item.operationLogId : null,
          startDate: startDate,
          endDate: endDate
        }, function (result) {
          if (!item) {
            setTimeout(function () {
              $scope.accountOperations.forEach(function (item) {
                item.inProgress = false;
              })
              toaster.pop('info', "", "Пересчет завершен");
              $scope.getAccountOperations();
            }, 3000)
            return;
          }
          item.tank = result.tank;
          item.tankStart = result.tankStart;
          item.tankEnd = result.tankEnd;
          item.deviation = result.deviation;
          item.inProgress = false;

          if ($scope.chartItem) {
            $scope.showChart($scope.chartItem);
          }

          toaster.pop('success', "", "Успешно");
        }, function (error) {
          if (item) {
            item.inProgress = false;
          } else {
            $scope.accountOperations.forEach(function (item) {
              item.inProgress = false;
            })
          }
          toaster.pop('error', "", error.data.message);
        });
      }

      $scope.$on('updateCurrentDivision', function (event, data) {
        $scope.getAccountOperations();
      });


    }]);
