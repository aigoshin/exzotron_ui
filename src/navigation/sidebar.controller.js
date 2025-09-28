angular.module('exzotron')
  .controller('SidebarController', ['$scope', '$rootScope', '$location', 'MenuService', 'toaster', 'BalanceService',
    '$window', 'SensorService', 'TankSensorService', 'ModalService', 'TankService', 'ObjectService', 'ObjectRfidService',
    '$filter', 'VehicleService', 'ApiServerService', 'IncomeService', 'FuelMovingService', 'CalibrationService', 'DivisionService',
    'NodeService', 'StorehouseService', 'UserService', 'ObservationObjectService', 'Upload', 'ReportService', 'CompanyAccountOperationService',
    'WeightOperationsService',
    function ($scope, $rootScope, $location, MenuService, toaster, BalanceService,
              $window, SensorService, TankSensorService, ModalService, TankService, ObjectService, ObjectRfidService,
              $filter, VehicleService, ApiServerService, IncomeService, FuelMovingService, CalibrationService, DivisionService,
              NodeService, StorehouseService, UserService, ObservationObjectService, Upload, ReportService, CompanyAccountOperationService,
              WeightOperationsService) {

      $scope.menuItems = [];
      $scope.subMenuItems = [];
      $scope.openedSubMenuId = null;
      $scope.parentMenuItems = [];
      $scope.objectRfidBalance = [];
      $scope.dateFrom = $rootScope.ui.dateFrom;
      $scope.dateTo = $rootScope.ui.dateTo;

      $scope.setUiVars = function () {
        setTimeout(function () {
          $scope.ui = {
            showReportByLog: false,
            showOnlyNonZeroItems: true,
            groupByObjects: false,
            showTankCharts: false,
            showLevelLine: true,
            showTemperatureLine: false,
            showDensityLine: false,
            showWeightLine: false,
            showWaterLine: false,
            showChartsByNodes: false,
            showConsumptionLine: true,
            showChartLineByRemains: UserService.storage.currentUser.byRemains,
            selectedObjects: [],
            selectedRfidObjects: [],
            selectAllObjects: false,
            selectAllRfid: false,
            rfidSearch: '',
            objectsSearch: '',
            selectedObjectsToAdd: [],
            selectedRfidObjectsToAdd: [],
            selectedTanks: [],
            apiObjectsRadio: 0,
            selectAllSync: false,
            currentSid: null,
            sensorInProgress: false,
            selectedTankId: null,
            showVehicleChart: false,
            vehiclesSearch: '',
            selectAllVehicles: false,
            selectedVehicles: [],
            mapAllObjects: true,
            weightTypes: [{value: 5, label: 'Груженный'}, {value: 6, label: 'Пустой'}, {
              value: 7,
              label: 'Неопределенно'
            }],
            selectedWeightTypes: [5, 6, 7],
            calibrationParam: 0,
            selectAllDivisions: false,
            selectAllStorehouses: false,
            selectedDivisions: [],
            selectedStorehouses: [],
            divisionSearch: '',
            storehouseSearch: '',
            selectedCalibrationParamsOut: [0],
            filterItems: [],
            intervalSeconds: 10
          };
        }, 300)
      }

      $scope.setUiVars();

      $scope.refresh = function (){
        $scope.currentObjectId = null;
        $scope.currentServer = null;
        $scope.currentVehicleId = null;
        $scope.selectedRfidObject = null;
        $scope.selectedRfidObjectToFilter = null;
        $scope.selectedTank = null;
        $scope.chartItem = null;
        $scope.currentRfid = null;
        $scope.currentCamera = null;
        $scope.intervalStarted = false;
      }

      $scope.refresh();

      $scope.setPaneProperties = function () {
        var leftPaneSize = $window.localStorage.getItem('leftPaneSize');
        var rightPaneSize = $window.localStorage.getItem('rightPaneSize');
        if (leftPaneSize !== undefined && rightPaneSize !== undefined) {
          setTimeout(function () {
            $scope.splitPaneProperties = {
              firstComponentSize: leftPaneSize,
              lastComponentSize: rightPaneSize
            };
          });
        }
      };

      $scope.$watch('splitPaneProperties.firstComponentSize', function (newVal, oldVal) {
        if (newVal != oldVal) {
          setTimeout(function () {
            $window.localStorage.setItem('leftPaneSize', newVal);
          })
        }
      });

      $scope.$watch('splitPaneProperties.lastComponentSize', function (newVal, oldVal) {
        if (newVal != oldVal) {
          setTimeout(function () {
            $window.localStorage.setItem('rightPaneSize', newVal);
          })
        }
      });

      $scope.getMenuItems = function () {
        MenuService.get({}, function (result) {
          $scope.menuItems = result;
          $scope.currentMenu = result[0].current;
          var firstMenuItem = $scope.menuItems[0]
          firstMenuItem.parentMenu.forEach(function (menu) {
            if (firstMenuItem.parentId === menu.menuId) {
              $location.path(menu.path).replace();
            }
          })
        }, function (error) {
          console.log(error);
        });
      }

      $scope.showSubPanel = function (menu) {
        let menuId = menu.menuId;

        if (menu.type === 2) {
          toaster.pop('warning', "", "Это функция!");
          return;
        }

        if (menu.type === 0 || menu.menuId === -1) {
          if (menu.menuId === -1) {
            menuId = menu.parentMenu[1].parentId;
            if (menuId == null) {
              return;
            }
          }
          MenuService.updateStartMenu({usersId: $rootScope.currentUser.usersId, menuId: menuId}, function (result) {
            $scope.menuItems = result;
            $scope.currentMenu = result[0].current;
            let path = menu.path ? menu.path : $scope.currentMenu.path;
            if (path) {
              $location.path(path).replace();
              $scope.refresh();
              $scope.setUiVars();
            } else {
              $location.path("/").replace();
            }
          }, function (error) {
            toaster.pop('error', "", error.data.message);
          });
        }
      }

      $scope.displayMenuItem = function (menu) {
        return menu.type === 0 || menu.menuId === -1;
      }

      $scope.showRfidCardsPanel = function () {
        return $location.path() === '/balance'
      }

      $scope.showDetailedRfidCardsPanel = function () {
        return $location.path() === '/report_detailed_rfid'
      }

      $rootScope.$watch('currentObject.id', function (newVal, oldVal) {
        if (newVal !== oldVal) {
          if (newVal) {
            $scope.currentObjectId = newVal;
            $scope.getSensors();
          } else {
            $scope.currentObjectId = null;
            $scope.sensors = [];
          }
        }
      }, true);

      $rootScope.$watch('currentServer', function (newVal, oldVal) {
        if (newVal !== oldVal) {
          $scope.currentServer = newVal;
          if (newVal) {
            if ($scope.ui.apiObjectsRadio === 0) {
              $scope.getApiServerObjects();
            } else if ($scope.ui.apiObjectsRadio === 1) {
              $scope.getApiServerObjectsRfid();
            }
          }
        }
      }, true);

      $rootScope.$watch('currentVehicle.id', function (newVal, oldVal) {
        if (newVal !== oldVal) {
          if (newVal) {
            $scope.currentVehicleId = newVal;
            $scope.getVehicleSensors();
          } else {
            $scope.currentVehicleId = null;
            $scope.vehicleSensors = [];
          }
        }
      }, true);

      $scope.showSensorsPanel = function () {
        $scope.tank = $location.path() === '/tank';
        return ($location.path() === '/object' || $location.path() === '/tank') && $scope.currentObjectId;
      }

      $scope.showTanksPanel = function () {
        return $location.path() === '/fuel_storage';
      }

      $scope.showObjectsPanel = function () {
        return $location.path() === '/report_object' || $location.path() === '/report_totals_rfid' || $location.path() === '/report_vehicle_totals_and_details';
      }

      $scope.showWeightTypes = function () {
        return $location.path() === '/report_weighting' || $location.path() === '/report_weighting_rfid';
      }

      $scope.showObjectsIncomePanel = function () {
        return $location.path() === '/report_object_income';
      }

      $scope.showRfidObjectsPanel = function () {
        return $location.path() === '/report_rfid' ;
      }

      $scope.showRfidObjectsEnrolPanel = function () {
        return $location.path() === '/enrol';
      }

      $scope.showUserChat = function () {
        return ($location.path() === '/company' && $scope.currentCompany) || $location.path() === '/user_info_task';
      }

      $scope.showVehiclesIncomePanel = function () {
        return $location.path() === '/report_vehicle_income' || $location.path() === '/report_weighting_rfid';
      }

      $scope.showApiServerObjectsPanel = function () {
        return $location.path() === '/api_server' && $scope.currentServer;
      }

      $scope.showVehicleSensorsPanel = function () {
        return $location.path() === '/vehicle'
      }

      $scope.showIncomePanel = function () {
        return $location.path() === '/income';
        // return false;
      }

      $scope.showRfidMapPanel = function () {
        return $location.path() === '/object_rfid' && $scope.currentRfid;
      }

      $scope.showCalibrationTablePanel = function () {
        return $location.path() === '/calibration' && $scope.currentCalibration;
      }

      $scope.showDivisionsPanel = function (){
        return $location.path() === '/report_division';
      }

      $scope.showStorehousesPanel = function (){
        return $location.path() === '/report_fuel_moving' || $location.path() === '/report_detailed_storehouse';
      }

      $scope.showObservationObjectPanel = function (){
        return $location.path() === '/observation_object';
      }

      $scope.showEmployeePhotoPanel = function (){
        return $location.path() === '/employee';
      }

      $scope.showNodeInfoPanel = function () {
        return $location.path() === '/operator_menu' && $scope.nodeInfo;
      }

      $scope.showCompanyOperationPanel = function () {
        return $location.path() === '/partner';
      }

      $scope.showWeightOperationPanel = function () {
        return $location.path() === '/weight_operations';
      }

      $scope.showWeightingsPanel = function () {
        return $location.path() === '/report_weighting';
      }

      $rootScope.$on('setCurrentCompany', function (event, data) {
        $scope.currentCompany = data.currentCompany;
        $scope.ui.selectedUser = null;
        $scope.getCompanyUsers();
      });

      $scope.getCompanyUsers = function () {
        $scope.companyUsers = [];
        UserService.request.getUsersByCurrentCompany({}, function (result) {
          $scope.companyUsers = result;
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      }

      $scope.showUserName = function (user) {
        let firstName = user.firstName ? user.firstName : '';
        let lastName = user.lastName ? user.lastName : '';
        return !firstName&&!lastName? user.usersName: firstName + ' ' + lastName;
      }

      $scope.selectCurrentUser = function (user) {
        $scope.ui.userMessages = [];
        
        if ($scope.ui.selectedUser && user.usersId === $scope.ui.selectedUser.usersId) {
          $scope.ui.selectedUser = null;
          $rootScope.$broadcast('selectChatUser', {user: $scope.ui.selectedUser});
          return;
        }

        $scope.ui.selectedUser = user;
        UserService.request.getMessages({userId:$scope.ui.selectedUser.telegram}, function (result) {
          $scope.ui.userMessages = result;
          $rootScope.$broadcast('selectChatUser', {user: $scope.ui.selectedUser});
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      }

      $scope.editUser = function (user) {
        $scope.ui.selectedForEditUser = angular.copy(user);
      }

      $scope.cancelUser = function () {
        $scope.ui.selectedForEditUser = null;
      }

      $scope.showUserName = function (user) {
        let firstName = user.firstName ? user.firstName : '';
        let lastName = user.lastName ? user.lastName : '';
        return !firstName&&!lastName? user.usersName: firstName + ' ' + lastName;
      }

      $scope.saveUser = function (user) {
        UserService.crud.save($scope.ui.selectedForEditUser, function (result) {
          user.usersEmail = $scope.ui.selectedForEditUser.usersEmail;
          user.usersPhone = $scope.ui.selectedForEditUser.usersPhone;
          $scope.cancelUser();
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.sendMessage = function () {
        if(!$scope.ui.userMessage){
          return;
        }
        let msg = {
          chatId: $scope.ui.selectedUser.telegram,
          status: 'read',
          dateSent: moment().format('YYYY-MM-DD HH:mm:ss'),
          senderId: $rootScope.currentUser.telegram,
          messageText: $scope.ui.userMessage,
          messageId: -1
        }

        UserService.request.sendMessage(msg, function (result) {
          $scope.ui.userMessage = null;
          $scope.ui.userMessages.push(msg);
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      }


      $scope.getObjectsByProduct = function () {
        $scope.ui.mapAllObjects = true;
        $scope.objectsByProduct = [];
        ObjectService.getObjectsByProduct({rfidId:$scope.currentRfid.id}, function (result) {
          $scope.objectsByProduct = result;
          $scope.objectsByProduct.forEach(function (item){
            if(!item.mapped){
              $scope.ui.mapAllObjects = false;
            }
          });
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      }

      $scope.recalculateRfid = function () {
        const startDate = moment($rootScope.ui.dateFrom).format('YYYY-MM-DD HH:mm:ss');
        const endDate = moment($rootScope.ui.dateTo).format('YYYY-MM-DD HH:mm:ss');
        const rfidId = $scope.currentRfid.id;
        $scope.recalcInProgress = true;

        ObjectRfidService.recalculateRfid({rfidId, startDate, endDate}, function (result) {
          $scope.recalcInProgress = false;
          toaster.pop('success', "", "Пересчет закончен");
        }, function (error) {
          $scope.recalcInProgress = false;
          toaster.pop('error', "", error.data.message);
        });
      }

      $scope.getCalibrationTable = function () {
        $scope.calibrationTable = [];
        CalibrationService.getCalibrationTable({calibrationId: $scope.currentCalibration.id}, function (result) {
          $scope.calibrationTable = result;
          $scope.drawCalibrationTableChart($scope.calibrationTable.map(function (o){
            return {x: o.paramIn, y: o['paramOut'+$scope.ui.calibrationParam]};
          }))
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      }

      $scope.prepareCalibrationTableChart = function (i) {
        $scope.ui.selectedCalibrationParamsOut = [i]
        $scope.drawCalibrationTableChart($scope.calibrationTable.map(function (o) {
          return {x: o.paramIn, y: o['paramOut' + i]};
        }))
      }

      function maybeDisposeRoot(divId) {
        am5.array.each(am5.registry.rootElements, function (root) {
          if (root.dom.id == divId) {
            root.dispose();
          }
        });
      }

      $scope.getDivisions = function () {
        $scope.divisions = [];
        DivisionService.get({}, function (result) {
          if ($rootScope.currentUser.currentDivisionId && $rootScope.currentUser.currentDivisionId !== -1) {
            $scope.divisions = result.filter(function (item) {
              return item.id === $rootScope.currentUser.currentDivisionId;
            });
          } else {
            $scope.divisions = result;
          }

        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.getStorehouses = function () {
        $scope.storehouses = [];
        StorehouseService.get({}, function (result) {
          $scope.storehouses = result;
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.drawCalibrationTableChart = function (data) {
        setTimeout(function () {
          maybeDisposeRoot('chartdiv_cal');
          let root = am5.Root.new('chartdiv_cal');
          root.locale = am5locales_ru_RU;

          const chart = root.container.children.push(am5xy.XYChart.new(root, {}));

          chart.get("colors").set("colors", [
            am5.color("#2b75c3")
          ]);

          const xAxis = chart.xAxes.push(
            am5xy.ValueAxis.new(root, {
              tooltip: am5.Tooltip.new(root, {}),
              max: Math.max.apply(Math, data.map(function(o) { return o.x; })),
              renderer: am5xy.AxisRendererX.new(root, {})
            })
          );

          const yAxis = chart.yAxes.push(
            am5xy.ValueAxis.new(root, {
              tooltip: am5.Tooltip.new(root, {}),
              max: Math.max.apply(Math, data.map(function(o) { return o.y; })),
              renderer: am5xy.AxisRendererY.new(root, {})
            })
          );

          const yRenderer = yAxis.get("renderer");
          yRenderer.labels.template.setAll({
            fill: am5.color("#8a8a8a")
          });

          const xRenderer = xAxis.get("renderer");
          xRenderer.labels.template.setAll({
            fill: am5.color("#8a8a8a")
          });

          chart.set("cursor", am5xy.XYCursor.new(root, {
            behavior: "none"
          }));

          chart.series.push(generateSeries(root, xAxis, yAxis, data, 'Уровень', 2, true));
        })
      }

      function generateSeries(root, xAxis, yAxis, data, name, strokeWidth, visible) {
        if (!data) {
          data = [];
        }
        let series = am5xy.SmoothedXLineSeries.new(root, {
          name: name,
          xAxis: xAxis,
          yAxis: yAxis,
          valueYField: "y",
          valueXField: "x",
          visible: visible
        });

        series.data.setAll(data);

        series.strokes.template.setAll({
          strokeWidth: strokeWidth
        });

        return series;
      }

      $scope.getCalibrationExportUrl = function (type, fileName) {
        let selectedCalibrationParamsOut = $scope.ui.selectedCalibrationParamsOut;
        return encodeURI( '/api/v1/calibration/export?type=' + type + "&paramOut=" + selectedCalibrationParamsOut +
          "&fileName=" + fileName + "&calibrationId=" + $scope.currentCalibration.id);
      }

      $scope.updateRfidObjectMapping = function (mapped, objectId){
        ObjectService.mapObjectToRfid({rfidId:$scope.currentRfid.id, mapped: mapped, objectId: objectId}, function (result) {
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      }

      $scope.mapAllObjectsToRfid= function (mapAllObjects){
        ObjectService.mapAllObjectsToRfid({mapAllObjects:mapAllObjects, rfidId: $scope.currentRfid.id}, function (result) {
          $scope.objectsByProduct.forEach(function (item) {
            item.mapped = mapAllObjects;
          });
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      }

      $scope.getObjectRfidBalance = function () {
        setTimeout(function (){
          $scope.objectRfidBalance = [];
          var startDate = moment($rootScope.ui.dateFrom).format('YYYY-MM-DD HH:mm:ss');
          var endDate = moment($rootScope.ui.dateTo).format('YYYY-MM-DD HH:mm:ss');
          var all = !$scope.ui.showOnlyNonZeroItems;
          var groupByObjects = $scope.ui.groupByObjects;

          BalanceService.getObjectRfidBalance({startDate, endDate, all, groupByObjects}, function (result) {
            $scope.objectRfidBalance = result;
            $scope.sumTotals();
          }, function (error) {
            toaster.pop('error', "", error.data.message);
          });
        },500)
      }

      $scope.getSensors = function () {
        $scope.sensors = [];
        if ($scope.tank) {
          TankSensorService.getSensorsByTank({tankId: $scope.currentObjectId}, function (result) {
            $scope.sensors = result;
          }, function (error) {
            toaster.pop('error', "", error.data.message);
          });
        } else {
          SensorService.getSensorsByObject({objectId: $scope.currentObjectId}, function (result) {
            $scope.sensors = result;
          }, function (error) {
            toaster.pop('error', "", error.data.message);
          });
        }
      }

      $scope.getSensorTypes = function () {
        $scope.sensorTypes = [];
        SensorService.getSensorTypes({}, function (result) {
          $scope.sensorTypes = result;
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.getTankSensorTypes = function () {
        $scope.tankSensorTypes = [];
        TankSensorService.getSensorTypes({}, function (result) {
          $scope.tankSensorTypes = result;
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.prepareModalOptions = function (sensor, tank) {
        let customOptions = {
          animation: false,
          templateUrl: tank ? 'static/src/tpl/add_tank_sensor_modal.html' : 'static/src/tpl/add_sensor_modal.html',
          backdrop: 'static',
          windowClass: 'form-modal',
          size: 'lg',
          resolve: {
            data: function () {
              return {
                sensorTypes: tank ? $scope.tankSensorTypes : $scope.sensorTypes,
                sensor: angular.copy(sensor),
                tank: tank
              }
            }
          },
          controller: ['$scope', '$uibModalInstance', 'Upload', 'SensorService', 'data', 'TankSensorService', function ($scope, $uibModalInstance, Upload, SensorService, data, TankSensorService) {
            $scope.data = data;
            $scope.exportUrl = $scope.data.tank ? '/api/v1/export_tank_sensor_calibration?id=' + $scope.data.sensor.sensorId : '/api/v1/export_sensor_calibration?id=' + $scope.data.sensor.sensorId;
            $scope.currentSensorType = $scope.data.sensorTypes.find(function (item) {
              if ($scope.data.tank) {
                return item.id === $scope.data.sensor.sensorTypeId;
              } else {
                return item.sensorTypeId === $scope.data.sensor.sensorTypeId;
              }
            });

            $scope.getSourceData = function () {
              if (!$scope.data.tank) {
                return;
              }
              $scope.data.sourceData = [];
              TankSensorService.getSourceData({tankId:$scope.data.sensor.tankId}, function (result) {
                $scope.data.sourceData = result;
              }, function (error) {
                toaster.pop('error', "", error.data.message);
              });
            };

            $scope.getSourceData();

            $scope.pasteCalibration = function ($event) {
              let clipboardData = $event.originalEvent.clipboardData || window.clipboardData;
              let pastedText = clipboardData.getData('text');
              let rows = pastedText.split(`\r`);

              rows.forEach(function (row) {
                $scope.data.sensor.sensorCalibrationList.push({
                  in: parseFloat(row.split('\t')[0].replace(/\D/g, '')),
                  out: parseFloat(row.split('\t')[1].replace(/\D/g, ''))
                })
              });
            }

            $scope.getSensor = function (id) {
              if ($scope.data.tank) {
                TankSensorService.getSensor({id: id}, function (result) {
                  $scope.data.sensor = result;
                }, function (error) {
                  toaster.pop('error', "", error.data.message);
                });
              } else {
                SensorService.getSensor({id: id}, function (result) {
                  $scope.data.sensor = result;
                }, function (error) {
                  toaster.pop('error', "", error.data.message);
                });
              }
            };

            $scope.updateSensorType = function (id) {
              $scope.currentSensorType = $scope.data.sensorTypes.find(function (item) {
                if ($scope.data.tank) {
                  return item.id === id;
                } else {
                  return item.sensorTypeId === id;
                }
              });
            };

            $scope.import = function (file) {
              if (!file) {
                return;
              }
              let id = $scope.data.sensor.sensorId;
              Upload.upload({
                url: $scope.data.tank ? '/api/v1/import_tank_sensor_calibration?id=' + id : '/api/v1/import_sensor_calibration?id=' + id,
                file: file
              }).then(function (result) {
                $scope.getSensor(id);
              }, function (result) {
                toaster.pop("error", "Error", result.data.message);
              });
            };

            $scope.ok = function (form) {
              if (form.$invalid) {
                return;
              }
              $uibModalInstance.close($scope.data.sensor);
            };

            $scope.cancel = function () {
              $uibModalInstance.dismiss();
            };

            $scope.deleteCalibration = function (index) {
              $scope.data.sensor.sensorCalibrationList.splice(index, 1);
            }
          }]
        }

        ModalService.showModal(customOptions, {}).then(function (result) {
          if (result) {
            if ($scope.tank) {
              TankSensorService.saveSensor(result, function (res) {
                $scope.getSensors();
                $rootScope.$broadcast('reloadTanks', {});
              }, function (error) {
                toaster.pop('error', "", error.data.message);
              });
            } else {
              SensorService.saveSensor(result, function (res) {
                $scope.getSensors();
              }, function (error) {
                toaster.pop('error', "", error.data.message);
              });
            }
          } else {
            $scope.getSensors();
          }
        });
      }

      $scope.showSensorModal = function (sensor) {
        if ($scope.tank) {
          $scope.showTankSensorModal(sensor)
          return;
        }

        if (!sensor.objectId) {
          sensor.objectId = $scope.currentObjectId;
        }

        if (sensor.sensorId) {
          SensorService.getSensor({id: sensor.sensorId}, function (result) {
            $scope.prepareModalOptions(result);
          }, function (error) {
            toaster.pop('error', "", error.data.message);
          });
        } else {
          sensor.sensorCalibrationList = [];
          $scope.prepareModalOptions(sensor);
        }
      };

      $scope.showTankSensorModal = function (sensor) {
        if (!sensor.tankId) {
          sensor.tankId = $scope.currentObjectId;
        }

        if (sensor.sensorId) {
          TankSensorService.getSensor({id: sensor.sensorId}, function (result) {
            $scope.prepareModalOptions(result, true);
          }, function (error) {
            toaster.pop('error', "", error.data.message);
          });
        } else {
          sensor.sensorCalibrationList = [];
          $scope.prepareModalOptions(sensor, true);
        }
      };

      $scope.deleteSensor = function (sensor) {
        if ($scope.tank) {
          TankSensorService.deleteSensor({sensorId: sensor.sensorId}, function (result) {
            $scope.getSensors();
            $rootScope.$broadcast('reloadTanks', {});
          }, function (error) {
            toaster.pop('error', "", error.data.message);
          });
        } else {
          SensorService.deleteSensor({sensorId: sensor.sensorId}, function (result) {
            $scope.getSensors();
          }, function (error) {
            toaster.pop('error', "", error.data.message);
          });
        }
      }

      $scope.tanks = [];
      $scope.firstLoad = true;
      $scope.getTankLog = function () {
        $scope.tanks = [];
        $scope.totalLevel = '';
        $scope.totalVolume = '';
        $scope.totalWeight = '';
        $scope.totalQuantity = '';
        $scope.totalInput = '';
        $scope.totalLevelMin = '';

        const params = {grouped: true, byNodes: $scope.ui.showChartsByNodes};
        // if ($scope.ui.showChartsByNodes) {
          params.startDate = moment($rootScope.ui.dateFrom).format('YYYY-MM-DD HH:mm:ss');
          params.endDate = moment($rootScope.ui.dateTo).format('YYYY-MM-DD HH:mm:ss');
        // }
        TankService.log(params, function (result) {
          $scope.tanks = result.tankLogs;
          $scope.someTankSensorExist = $scope.tanks.some(function (tank) {
            return !tank.sensorExists;
          });
          if ($scope.firstLoad) {
            if ($scope.ui.showChartsByNodes) {
              $scope.ui.selectedTanks = $scope.tanks.map(function (item) {
                return item.storehouseId;
              });
            } else {
              $scope.ui.selectedTanks = $scope.tanks.map(function (item) {
                return item.tankId;
              });
            }
            $scope.firstLoad = !$scope.ui.selectedTanks.length;
          }

          $scope.applyTankLogs();
          $scope.sumTanksTotals();
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.inputsMap = {};

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

      $scope.getIncomeLog = function () {
        $scope.incomeLog = [];
        if (!$scope.incomeLogStorehouse) {
          return;
        }
        var startDate = moment($rootScope.ui.dateFrom).format('YYYY-MM-DD HH:mm:ss');
        var endDate = moment($rootScope.ui.dateTo).format('YYYY-MM-DD HH:mm:ss');
        var storehouseId = $scope.incomeLogStorehouse.storehouseId;

        IncomeService.get({startDate, endDate, storehouseId}, function (result) {
          $scope.incomeLog = result;
          $scope.sumIncomeLogs();
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.sumIncomeLogs = function () {
        $scope.totalCounterDoc = $scope.sum($scope.incomeLog, 'litresCounterDoc');
        $scope.totalCounterIn = $scope.sum($scope.incomeLog, 'litresCounterIn');
        $scope.totalCounterDeviation = $scope.sum($scope.incomeLog, 'litresCounterDeviation');
      }

      $scope.sumTanksTotals = function () {
        $scope.totalLevel = $scope.sum($scope.tanks, 'level');
        $scope.totalVolume = $scope.sum($scope.tanks, 'tankVolume');
        $scope.totalWeight = $scope.sum($scope.tanks, 'weight');
        $scope.totalQuantity = $scope.sum($scope.tanks, 'quantity');
        $scope.totalInput = $scope.sum($scope.tanks, 'input');
        $scope.totalLevelMin = $scope.sum($scope.tanks, 'levelMin');
      }

      $rootScope.$watch('ui.dateFrom', function (newVal, oldVal) {
        if (newVal !== oldVal) {
          $scope.changeStartDate(true);
        }
      }, true);

      $rootScope.$watch('ui.dateTo', function (newVal, oldVal) {
        if (newVal !== oldVal) {
          $scope.changeStartDate(false);
        }
      }, true);

      $scope.changeStartDate = function (start) {
        if ($scope.showTanksPanel()) {
          $scope.getTankLog();
          $scope.getIncomeLog();
        } else if ($scope.showRfidCardsPanel()) {
          $scope.getObjectRfidBalance();
        }
      }

      $rootScope.$watch('currentUser.currentProductId', function (newVal, oldVal) {
        if (newVal !== oldVal && newVal && oldVal) {
          if ($scope.showTanksPanel()) {
            $scope.getTankLog();
            $scope.getIncomeLog();
          } else if ($scope.showObjectsPanel()) {
            $scope.getObjects();
          } else if ($scope.showRfidObjectsPanel()) {
            $scope.getRfidObjects();
          } else {
            $scope.getObjectRfidBalance();
          }
        }
      }, true);

      // $rootScope.$watch('currentUser.byRemains', function (newVal, oldVal) {
      //   if (newVal !== oldVal && newVal!==undefined) {
      //     if ($scope.showTanksPanel()) {
      //       $scope.ui.showChartLineByRemains = !!newVal;
      //       $scope.getTankLog();
      //     }
      //   }
      // }, true);

      $scope.filterNonZeroItems = function (item) {
        if (!$scope.ui.showOnlyNonZeroItems) {
          return true;
        }

        return item.credit !== 0 || item.debit !== 0;
      };

      $scope.sum = function (array, property) {
        return array.reduce((accumulator, current) => accumulator + current[property], 0);
      }

      $scope.sumTotals = function () {
        $scope.totalCredit = $scope.sum($scope.objectRfidBalance, 'credit');
        $scope.totalDebit = $scope.sum($scope.objectRfidBalance, 'debit');
        $scope.totalBalance = $scope.sum($scope.objectRfidBalance, 'balance');
      }

      $scope.$on('selectAccountOperation', function (event, data) {
        if ($scope.selectedRfidObjectToFilter) {
          return;
        }
        var accountOperation = data.accountOperation;
        $scope.selectedRfidObject = $scope.objectRfidBalance.find(function (item) {
          return item.rfid === accountOperation.account;
        });
      });

      $scope.$on('selectNode', function (event, data) {
        $scope.selectedNode = data;
        const id = data.nodeId;

        NodeService.getOne({id}, function (result) {
          $scope.nodeInfo = result;
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      });

      $scope.$on('setCurrentRfid', function (event, data) {
        $scope.currentRfid = data.currentRfid;
        $scope.getObjectsByProduct();
      });

      $scope.$on('setCurrentCalibration', function (event, data) {
        $scope.currentCalibration = data.currentCalibration;
        $scope.getCalibrationTable();
      });

      $scope.filterAccountOperations = function (selectedRfidObject) {
        $scope.selectedRfidObject = null;

        if (selectedRfidObject == null ||
          ($scope.selectedRfidObjectToFilter
            && !$scope.ui.groupByObjects
            && $scope.selectedRfidObjectToFilter.rfid === selectedRfidObject.rfid) ||
          ($scope.selectedRfidObjectToFilter
            && $scope.ui.groupByObjects
            && $scope.selectedRfidObjectToFilter.imei === selectedRfidObject.imei)) {

          $scope.selectedRfidObjectToFilter = null;
          $scope.selectedRfidObject = null;
        } else {
          $scope.selectedRfidObjectToFilter = selectedRfidObject;
        }

        $rootScope.$broadcast('filterAccountOperations', {selectedRfidObject: $scope.selectedRfidObjectToFilter});
      };

      $scope.groupByObjects = function () {
        $scope.filterAccountOperations(null);
        $rootScope.$broadcast('groupByObjects', {groupByObjects: $scope.ui.groupByObjects});
      };

      $scope.applyTankLogs = function () {
        $rootScope.$broadcast('applyTankLogs', {selectedTanks: $scope.ui.selectedTanks});
      }

      $scope.showTankCharts = function () {
        $scope.selectedTank = null;
        $rootScope.$broadcast('showTankCharts', {showTankCharts: $scope.ui.showTankCharts, selectedTanks: $scope.ui.selectedTanks});
      };

      $scope.showChartsByNodes = function () {
        $scope.firstLoad = true;
        $scope.ui.selectedTanks = [];
        $scope.getTankLog();
        $scope.ui.showTankCharts = false;
        $scope.showTankCharts();
        $scope.selectTank(null);
        $rootScope.$broadcast('showChartsByNodes', {showChartsByNodes: $scope.ui.showChartsByNodes, selectedTanks: $scope.ui.selectedTanks});
      };

      $scope.selectTankId = function (selectedTankId) {
        if ($scope.ui.selectedTankId) {
          $scope.ui.selectedTankId = selectedTankId;
          $rootScope.$broadcast('selectTankId', {selectedTankId: $scope.ui.selectedTankId});
        }
      };

      $scope.showLevelLine = function () {
        $rootScope.$broadcast('showLevelLine', {showLevelLine: $scope.ui.showLevelLine});
      };

      $scope.showTemperatureLine = function () {
        $rootScope.$broadcast('showTemperatureLine', {showTemperatureLine: $scope.ui.showTemperatureLine});
      };

      $scope.showDensityLine = function () {
        $rootScope.$broadcast('showDensityLine', {showDensityLine: $scope.ui.showDensityLine});
      };

      $scope.showWeightLine = function () {
        $rootScope.$broadcast('showWeightLine', {showWeightLine: $scope.ui.showWeightLine});
      };

      $scope.showWaterLine = function () {
        $rootScope.$broadcast('showWaterLine', {showWaterLine: $scope.ui.showWaterLine});
      };

      $scope.showConsumptionLine = function () {
        $rootScope.$broadcast('showConsumptionLine', {showConsumptionLine: $scope.ui.showConsumptionLine});
      };

      $scope.showChartLineByRemains = function () {
        UserService.request.setByRemains({byRemains: $scope.ui.showChartLineByRemains}, function (result) {
          $rootScope.currentUser.byRemains = $scope.ui.showChartLineByRemains;
          $scope.getTankLog();
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
        $rootScope.$broadcast('showChartLineByRemains', {showChartLineByRemains: $scope.ui.showChartLineByRemains, selectedTanks: $scope.ui.selectedTanks});
      };

      $scope.selectTank = function (tank) {
        $scope.incomeLogStorehouse = tank;
        if ($scope.ui.showTankCharts) {
          if ($scope.selectedTank && $scope.selectedTank.tankId === tank.tankId) {
            $scope.selectedTank = null;
          } else {
            $scope.selectedTank = tank
          }
        } else {
          $scope.selectedTank = null;
        }
        $scope.getIncomeLog();

        if ($scope.ui.showReportByLog) {
          $scope.getReportByLog();
        } else {
          $scope.getReport();
        }

        $rootScope.$broadcast('selectTank', {selectedTank: $scope.selectedTank});
      };

      $scope.toggleReportByLog = function (){
        if ($scope.ui.showReportByLog) {
          $scope.getReportByLog();
        } else {
          $scope.getReport();
        }
      }

      $scope.exportExcelDetailedReport = function (){
        if (!$scope.incomeLogStorehouse) {
          return;
        }
        $rootScope.exportExcel('api/v1/export_detailed_storehouse_report_excel?byDays=' + false + '&control=' + true + '&byLog=' + $scope.ui.showReportByLog + '&dateFrom=' +  moment($rootScope.ui.dateFrom).format('YYYY-MM-DD HH:mm:ss') + '&dateTo=' +  moment($rootScope.ui.dateTo).format('YYYY-MM-DD HH:mm:ss') + '&storehouseIds=' + $scope.incomeLogStorehouse.storehouseId, 'GET', {}, 'report_detailed_storehouse.xls');
      }

      $scope.getObjects = function () {
        ObjectService.getObjects({filterByDivision: true}, function (result) {
          $scope.objects = result;
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      }

      $scope.getRfidObjects = function () {
        ObjectRfidService.getRfidObjects({}, function (result) {
          $scope.rfidObjects = result;
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      }

      $scope.getObjectsRfidForCurrentUser = function () {
        ObjectRfidService.getObjectsRfidForCurrentUser({}, function (result) {
          $scope.rfidObjects = result;
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      }

      $scope.clickRfidObjectEnrol = function (item){
        if ($scope.selectedRfidObjectEnrol && $scope.selectedRfidObjectEnrol.rfid === item.rfid) {
          $scope.selectedRfidObjectEnrol = null;
        } else {
          $scope.selectedRfidObjectEnrol = item;
        }

        $rootScope.$broadcast('selectRfidObjectEnrol', {selectedRfidObjectEnrol: $scope.selectedRfidObjectEnrol});
      }

      $scope.selectedClass = function (item) {
        if (!item) {
          return '';
        }
        if ($scope.ui.groupByObjects) {
          return $scope.selectedRfidObjectToFilter && $scope.selectedRfidObjectToFilter.imei === item.imei ? 'badge-secondary' : '';
        }
        return $scope.selectedRfidObjectToFilter && $scope.selectedRfidObjectToFilter.rfid === item.rfid ? 'badge-secondary' : '';
      }

      $scope.reportObject = function () {
        if ($scope.ui.selectAllObjects && $scope.ui.objectsSearch) {
          $scope.ui.selectedObjects = $filter('filter')($scope.objects, {name: $scope.ui.objectsSearch}).map(function (item) {
            return item.imei;
          });
        }

        $rootScope.$broadcast('selectObject', {selectedObjects: $scope.ui.selectedObjects, weightTypes: $scope.ui.selectedWeightTypes});
      }

      $scope.reportWeightingObject = function () {
        if ($scope.ui.selectAllObjects && $scope.ui.objectsSearch) {
          $scope.ui.selectedObjects = $filter('filter')($scope.weightOperations, {name: $scope.ui.objectsSearch}).map(function (item) {
            return item.weightbridgeId;
          });
        }

        $rootScope.$broadcast('selectObject', {selectedObjects: $scope.ui.selectedObjects, weightTypes: $scope.ui.selectedWeightTypes});
      }


      $scope.reportDetailedRfid = function () {
        if ($scope.ui.selectAllObjects && $scope.ui.objectsSearch) {
          $scope.ui.selectedObjects = $filter('filter')($scope.objects, {name: $scope.ui.objectsSearch}).map(function (item) {
            return item.imei;
          });
        }
        if ($scope.ui.selectAllRfid && $scope.ui.rfidSearch) {
          $scope.ui.selectedRfidObjects = $filter('filter')($scope.rfidObjects, {name: $scope.ui.rfidSearch}).map(function (item) {
            return item.rfid;
          });
        }

        $rootScope.$broadcast('detailedReportRfid', {
          selectedObjects: $scope.ui.selectedObjects,
          selectedRfidObjects: $scope.ui.selectedRfidObjects
        });
      }

      $scope.reportDivision = function () {
        if ($scope.ui.selectAllDivisions && $scope.ui.divisionSearch) {
          $scope.ui.selectedDivisions = $filter('filter')($scope.divisions, {name: $scope.ui.divisionSearch}).map(function (item) {
            return item.id;
          });
        }

        $rootScope.$broadcast('selectDivision', {selectedDivisions: $scope.ui.selectedDivisions});
      }

      $scope.reportFuelMoving = function () {
        if ($scope.ui.selectAllStorehouses && $scope.ui.storehouseSearch) {
          $scope.ui.selectedStorehouses = $filter('filter')($scope.storehouses, {name: $scope.ui.storehouseSearch}).map(function (item) {
            return item.id;
          });
        }

        $rootScope.$broadcast('selectStorehouse', {selectedStorehouses: $scope.ui.selectedStorehouses});
      }

      $scope.reportVehicle = function () {
        if ($scope.ui.selectAllVehicles && $scope.ui.vehiclesSearch) {
          $scope.ui.selectedVehicles = $filter('filter')($scope.vehicles, {name: $scope.ui.vehiclesSearch}).map(function (item) {
            return item.id;
          });
        }

        $rootScope.$broadcast('selectVehicle', {selectedVehicles: $scope.ui.selectedVehicles});
      }
      $scope.reportRfid = function () {
        if ($scope.ui.selectAllRfid && $scope.ui.rfidSearch) {
          $scope.ui.selectedRfidObjects = $filter('filter')($scope.rfidObjects, {name: $scope.ui.rfidSearch}).map(function (item) {
            return item.rfid;
          });
        }

        $rootScope.$broadcast('selectRfidObject', {selectedRfidObjects: $scope.ui.selectedRfidObjects, weightTypes: $scope.ui.selectedWeightTypes});
      }

      $scope.selectAllRfid = function () {
        if ($scope.ui.selectAllRfid) {
          $scope.ui.selectedRfidObjects = $scope.rfidObjects.map(function (item) {
            return item.rfid;
          });
        } else {
          $scope.ui.selectedRfidObjects = false;
        }
      }

      $scope.selectAllObjects = function () {
        if ($scope.ui.selectAllObjects) {
          $scope.ui.selectedObjects = $scope.objects.map(function (item) {
            return item.imei;
          });
        } else {
          $scope.ui.selectedObjects = [];
        }
      }

      $scope.selectAllWeightings = function () {
        if ($scope.ui.selectAllObjects) {
          $scope.ui.selectedObjects = $scope.weightOperations.map(function (item) {
            return item.weightbridgeId;
          });
        } else {
          $scope.ui.selectedObjects = [];
        }
      }

      $scope.selectAllDivisions = function () {
        if ($scope.ui.selectAllDivisions) {
          $scope.ui.selectedDivisions = $scope.divisions.map(function (item) {
            return item.id;
          });
        } else {
          $scope.ui.selectedDivisions = [];
        }
      }
      $scope.selectAllStorehouses = function () {
        if ($scope.ui.selectAllStorehouses) {
          $scope.ui.selectedStorehouses = $scope.storehouses.map(function (item) {
            return item.id;
          });
        } else {
          $scope.ui.selectedStorehouses = [];
        }
      }

      $scope.selectAllVehicles = function () {
        if ($scope.ui.selectAllVehicles) {
          $scope.ui.selectedVehicles = $scope.vehicles.map(function (item) {
            return item.id;
          });
        } else {
          $scope.ui.selectedVehicles = [];
        }
      }

      $scope.getApiServerObjects = function () {
        if (!$scope.currentServer.active) {
          $scope.serverObjects = [];
          return;
        }
        ApiServerService.getObjectsByServerId({id: $scope.currentServer.id}, function (result) {
          $scope.serverObjects = result;
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      }

      $scope.getApiServerObjectsRfid = function () {
        if (!$scope.currentServer.active) {
          $scope.serverObjectsRfid = [];
          return;
        }
        ApiServerService.getObjectsRfidByServerId({id: $scope.currentServer.id}, function (result) {
          $scope.serverObjectsRfid = result;
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      }

      $scope.synchronize = function () {
        if ($scope.ui.apiObjectsRadio === 0) {
          ApiServerService.synchronizeObjects($scope.ui.selectedObjectsToAdd, function (result) {
            toaster.pop('success', "", "Синхронизировано");
            $scope.ui.selectedObjectsToAdd = [];
            $scope.getApiServerObjects();
          }, function (error) {
            toaster.pop('error', "", error.data.message);
          });
        } else {
          ApiServerService.synchronizeRfidObjects($scope.ui.selectedRfidObjectsToAdd, function (result) {
            toaster.pop('success', "", "Синхронизировано");
            $scope.ui.selectedRfidObjectsToAdd = [];
            $scope.getApiServerObjectsRfid();
          }, function (error) {
            toaster.pop('error', "", error.data.message);
          });
        }
      }

      $scope.selectAllSync = function () {
        if (!$scope.ui.selectAllSync) {
          $scope.ui.selectedObjectsToAdd = [];
          $scope.ui.selectedRfidObjectsToAdd = [];
        } else {
          if ($scope.ui.apiObjectsRadio === 0) {
            $scope.ui.selectedObjectsToAdd = $scope.serverObjects.filter(function (item) {
              return !item.exists;
            });
          } else {
            $scope.ui.selectedRfidObjectsToAdd = $scope.serverObjectsRfid.filter(function (item) {
              return !item.exists;
            });
          }
        }
      }

      $scope.combineVehicles = function () {
        VehicleService.combine({}, function (result) {
          toaster.pop('success', "", "Успешно");
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.getVehicleSensors = function () {
        if (!$scope.currentVehicleId) {
          return;
        }

        $scope.vehicleSensors = [];
        VehicleService.getVehicleSensors({id: $scope.currentVehicleId}, function (result) {
          $scope.vehicleSensors = result;
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.getVehicles = function () {
        $scope.vehicles = [];
        VehicleService.get({}, function (result) {
          $scope.vehicles = result;
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.setVehicleSensor = function (item) {
        VehicleService.setVehicleSensor({
          id: $scope.currentVehicleId,
          sid: item.sid,
          name: item.name,
          active: !item.active
        }, function (result) {
          $rootScope.$broadcast('vehicleSensorSelected', {});
          $scope.vehicleSensors.forEach(function (sensor) {
            if (sensor.sid !== item.sid) {
              sensor.active = false;
            }
          })
        }, function (error) {
          item.active = !item.active
          toaster.pop('error', "", error.data.message);
        });
      }

      $scope.generatingInProgress = false;
      $scope.generateTankLogs = function () {
        $scope.generatingInProgress = true;
        IncomeService.generate({}, function (result) {
          $scope.generatingInProgress = false;
          $rootScope.$broadcast('getIncomes', {});
        }, function (error) {
          toaster.pop('error', "", error.data.message);
          $scope.generatingInProgress = false;
        });
      }

      $scope.moveFuel = function () {
        let customOptions = {
          animation: false,
          templateUrl: 'static/src/tpl/move_fuel_modal.html',
          backdrop: 'static',
          windowClass: 'form-modal',
          size: 'lg',
          controller: ['$scope', '$uibModalInstance', '$rootScope', 'StorehouseService', 'TankService', function ($scope, $uibModalInstance, $rootScope, StorehouseService, TankService) {
            $scope.item = {};
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
          }]
        };

        ModalService.showModal(customOptions, {}).then(function (result) {
          if (result) {
            FuelMovingService.add(result, function (result) {
              $scope.getFuelMoving();
            }, function (error) {
              toaster.pop('error', "", error.data.message);
            });
          }
        });
      };

      $scope.getFuelMoving = function (){
        let params = {};
        params.startDate = moment($rootScope.ui.dateFrom).format('YYYY-MM-DD HH:mm:ss');
        params.endDate = moment($rootScope.ui.dateTo).format('YYYY-MM-DD HH:mm:ss');

        FuelMovingService.get(params, function (result) {
          $scope.fuelMoving = result;
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      }

      $scope.showBalanceChart = function () {
        $rootScope.$broadcast('showBalanceChart', {show: $scope.ui.showVehicleChart});
      }

      $scope.$on('setCurrentCamera', function (event, data) {
        $scope.currentCamera = data.currentCamera;
      });

      $scope.$on('selectEmployee', function (event, data) {
        $scope.selectedEmployee = data.selectedEmployee;
      });


      $scope.uploadEmployeePhoto = function (file) {
        if (!file) {
          return;
        }
        let id = $scope.selectedEmployee.id;
        Upload.upload({
          url: '/api/v1/employee/upload_photo?id=' + id,
          file: file
        }).then(function (result) {
          $scope.selectedEmployee = result.data;
        }, function (result) {
          toaster.pop("error", "Error", result.data.message);
        });
      };

      $scope.getCameraData = function () {
        let params = {};
        params.startDate = moment($rootScope.ui.dateFrom).format('YYYY-MM-DD HH:mm:ss');
        params.endDate = moment($rootScope.ui.dateTo).format('YYYY-MM-DD HH:mm:ss');
        params.cameraId = $scope.currentCamera.id;

        ObservationObjectService.getCameraData(params, function (result) {
          $scope.cameraData = result;
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      }

      $scope.$on('selectPartner', function (event, data) {
        $scope.selectedPartner = data.selectedPartner;
        $scope.getCompanyOperations();
      });

      $scope.getCompanyOperations = function () {
        $scope.companyOperations= [];
        let params = {};
        params.startDate = moment($rootScope.ui.dateFrom).format('YYYY-MM-DD HH:mm:ss');
        params.endDate = moment($rootScope.ui.dateTo).format('YYYY-MM-DD HH:mm:ss');
        params.partnerId = $scope.selectedPartner.id;

        CompanyAccountOperationService.getByPartner(params, function (result) {
          $scope.companyOperations = result;
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      }

      $scope.exportCompanyOperationsExcel = function (){
        let params = {};
        params.startDate = moment($rootScope.ui.dateFrom).format('YYYY-MM-DD HH:mm:ss');
        params.endDate = moment($rootScope.ui.dateTo).format('YYYY-MM-DD HH:mm:ss');
        params.partnerId = $scope.selectedPartner.id;
        $rootScope.exportExcel('api/v1/company_account_operations/export?startDate=' + params.startDate + '&endDate=' + params.endDate + '&partnerId=' + params.partnerId, 'GET', {}, 'company_operations.xlsx');
      }
      // $scope.prepareFilterItems = function (data) {
      //   $scope.filterItems = [];
      //   StorehouseService.get({}, function (result) {
      //     $scope.filterItems = result;
      //     setTimeout(function () {
      //       $scope.ui.filterItems = $scope.filterItems.map(function (item) {
      //         return item.id;
      //       })
      //       console.log($scope.ui.filterItems)
      //     }, 400)
      //
      //   }, function (error) {
      //     toaster.pop('error', "", error.data.message);
      //   });
      // }

      $rootScope.$on('updateCurrentPartner', function (event, data) {
        if ($scope.showRfidCardsPanel()) {
          $scope.getObjectRfidBalance();
        }
        if ($scope.showRfidObjectsEnrolPanel()) {
          $scope.getObjectsRfidForCurrentUser();
        } else {
          $scope.getRfidObjects();
        }
        $scope.getObjects();
        $scope.setUiVars();
      });

      $rootScope.$on('updateCurrentDivision', function (event, data) {
        if ($scope.showRfidCardsPanel()) {
          $scope.getObjectRfidBalance();
        } else if ($scope.showTanksPanel()) {
          $scope.getTankLog();
          $scope.getIncomeLog();
        } else if ($scope.showWeightOperationPanel() || $scope.showWeightings()) {
          $scope.getWeightOperations();
        }
        $scope.getObjects();
        $scope.getRfidObjects();
        $scope.setUiVars();
      });

      $scope.statusClass = function (status) {
        if (status == 0) {
          return 'bi-dash text-info';
        } else if (status == 1) {
          return 'bi-check text-success';
        } else if (status == 2) {
          return 'bi-x text-danger';
        } else {
          return '';
        }
      };

      $scope.startInterval = function (){
        $scope.intervalStarted = true;
        $rootScope.$broadcast('startInterval', {intervalSeconds: $scope.ui.intervalSeconds});
      }

      $scope.stopInterval = function (){
        $scope.intervalStarted = false;
        $rootScope.$broadcast('stopInterval');
      }

      $scope.getReportByLog = function () {
        if (!$scope.incomeLogStorehouse || !$scope.ui.showChartsByNodes) {
          return;
        }

        $scope.showDetailedReport = false;
        $scope.detailedReportItems = [];
        $scope.tankColumns = [];

        TankService.tankLevels({
          startDate: moment($rootScope.ui.dateFrom).format('YYYY-MM-DD HH:mm'),
          endDate: moment($rootScope.ui.dateTo).format('YYYY-MM-DD HH:mm'),
          storehouseId: $scope.incomeLogStorehouse.storehouseId
        }, function (result) {
          $scope.detailedReportItems = result;
          $scope.showDetailedReport = result.length;
          if ($scope.showDetailedReport) {

            $scope.tankColumns = [];

            const firstRow = result[0];
            for (const key in firstRow) {
              if (key !== 'total_liters' && key !== 'date_time' && firstRow.hasOwnProperty(key)) {
                $scope.tankColumns.push({
                  field: key
                });
              }

            }
          }
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };
      
      $scope.getReport = function () {
        if (!$scope.incomeLogStorehouse || !$scope.ui.showChartsByNodes) {
          return;
        }
        
        $scope.showDetailedReport = false;
        $scope.detailedReportItems = [];
        
        $scope.reportDateFrom = moment($rootScope.ui.dateFrom).format('YYYY-MM-DD HH:mm');
        $scope.reportDateTo = moment($rootScope.ui.dateTo).format('YYYY-MM-DD HH:mm');
        $scope.createdOn = moment().format('YYYY-MM-DD HH:mm');
        
        ReportService.reportDetailedStorehouse({
          dateFrom: $scope.reportDateFrom,
          dateTo: $scope.reportDateTo,
          storehouseIds: [$scope.incomeLogStorehouse.storehouseId],
          byDays: false,
          control: true
        }, function (result) {
          $scope.detailedReportItems = JSON.parse(result.data)[$scope.incomeLogStorehouse.storehouseId];
          $scope.showDetailedReport = Object.keys($scope.detailedReportItems).length;
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };
      
      $scope.selectDetailedReportItem = function (item) {
        $rootScope.$broadcast('selectDetailedReportItem', {selectedDetailedReportItem: item});
      }

      $scope.getWeightOperations = function () {
        $scope.weightOperations = [];
        WeightOperationsService.get({}, function (result) {
          $scope.weightOperations = result;
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.deleteWeightOperation = function (item) {
        WeightOperationsService.delete({'id': item.weightbridgeId}, function (result) {
          $scope.getWeightOperations();
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.selectWeightOperation = function (item) {
        if ($scope.selectedWeightOperation && $scope.selectedWeightOperation.weightbridgeId === item.weightbridgeId) {
          $scope.selectedWeightOperation = null;
        } else {
          $scope.selectedWeightOperation = item;
        }
        $rootScope.$broadcast('selectWeightOperation', {selectedWeightOperation: item});
      }

      $scope.setWeightOperationStatus = function (item) {
        WeightOperationsService.setStatus({id: item.weightbridgeId, active: item.active}, function (result) {
          $scope.getWeightOperations();
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.saveWeightOperation = function (item) {
        WeightOperationsService.save(item, function (result) {
          $scope.getWeightOperations();
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.addWeightOperation = function (item) {
        WeightOperationsService.add(item, function (result) {
          $scope.getWeightOperations();
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.showAddWeightOperationModal = function (item) {
        let customOptions = {
          animation: false,
          templateUrl: 'static/src/tpl/add_weighting_operation.html',
          backdrop: 'static',
          windowClass: 'form-modal',
          size: 'lg',
          resolve: {
            data: function () {
              return {
                item: item,
              }
            }
          },
          controller: ['$scope', '$uibModalInstance', 'data', function ($scope, $uibModalInstance, data) {
            $scope.item = data.item;
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
            if (result.weightbridgeId) {
              $scope.saveWeightOperation(result);
            } else {
              $scope.addWeightOperation(result);
            }
          }
        });
      };

      
      $scope.getMenuItems();
      $scope.getSensorTypes();
      $scope.getTankSensorTypes();
    }]);
