angular.module('exzotron')
  .controller('ObjectRfidController', ['$scope', '$rootScope', 'ObjectRfidService', 'ModalService', 'toaster', 'StorehouseService', 'EmployeeService', 'VehicleService', 'PartnerService', 'DivisionService', "$window",
    function ($scope, $rootScope, ObjectRfidService, ModalService, toaster, StorehouseService, EmployeeService, VehicleService, PartnerService, DivisionService, $window) {
      $scope.objectsRfid = [];
      $scope.employees = [];
      $scope.vehicles = [];
      $scope.divisions = [];
      $scope.partners = [];
      $scope.search = '';
      $scope.idUserTelegram = $rootScope.currentUser.telegram;
      $scope.newRfidObject = {
        name: null,
        rfid: null,
        typeRfid: 2,
        idUserTelegram: $scope.idUserTelegram
      }
      $scope.ui = {
        vehicles: []
      }

      let objectRfidFilter = $window.localStorage.getItem('objectRfidFilter');

      $scope.filter = objectRfidFilter ? JSON.parse(objectRfidFilter) : {
        rfid: null,
        showBlockedCards: true
      }

      $scope.$watch(function () {
        return $scope.filter;
      }, function (newVal, oldVal) {
        if (newVal && newVal !== oldVal) {
          setTimeout(function () {
            $window.localStorage.setItem('objectRfidFilter', JSON.stringify($scope.filter));
          })
        }
      }, true);

      $scope.advancedFilter = function (item) {
        return (!$scope.filter.rfid || item.rfid.indexOf($scope.filter.rfid) >= 0) &&
          ($scope.filter.showBlockedCards ? [0, 1, 2].includes(item.status) : [0, 1].includes(item.status))
      };

      /*функция генерации уникальной строки для применения фильтрации директивы column-chooser*/
      $scope.fireFunc = function () {
        let json = {
          search: $scope.search,
          filter: $scope.filter,
          items: $scope.objectsRfid
        }
        return window.btoa(unescape(encodeURIComponent(JSON.stringify(json))));
      }

      $scope.getObjectsRfid = function () {
        $scope.objectsRfid = [];
        $scope.loaded = false;
        ObjectRfidService.getObjectsRfidForCurrentUser({}, function (result) {
          $scope.objectsRfid = result;
          $scope.loaded = true;
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.getStorehouses = function () {
        StorehouseService.get({}, function (result) {
          $scope.storehouses = [{id: 0, name: null}]
          $scope.storehouses = $scope.storehouses.concat(result);
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.getEmployees = function () {
        EmployeeService.get({}, function (result) {
          $scope.employees = [{id: 0, name: null}]
          $scope.employees = $scope.employees.concat(result);
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.getLimitTypes = function () {
        ObjectRfidService.getLimitTypes({}, function (result) {
          $scope.limitTypes = result;
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };
      
      $scope.saveVehicle = function ($item, $model, selectedObject) {
        selectedObject.vehicleId = $item.id;
      }
      
      
      $scope.getVehicles = function (search) {
        if (!search) {
          $scope.ui.vehicles = $scope.ui.vehicles.concat([{id: 0, name: null}]);
          return;
        }
        VehicleService.get({search: search}, function (result) {
          $scope.ui.vehicles = result.map(function name(params) {
            return {id: params.id, name: params.name, imei: params.imei};
          });
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.getObjectRfidType = function () {
        $scope.objectsRfidTypes = [];
        ObjectRfidService.getObjectRfidType({}, function (result) {
          $scope.objectsRfidTypes = result;
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      }

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

      $scope.addRfid = function () {
        if (!$scope.idUserTelegram) {
          return;
        }
        ObjectRfidService.addRfid($scope.newRfidObject, function (result) {
          if (result.data.indexOf('add rfid') > -1) {
            $scope.newRfidObject.name = null;
            $scope.newRfidObject.rfid = null;
            toaster.pop('success', "", result.data);
            $scope.getObjectsRfid();
          } else {
            toaster.pop('error', "", result.data);
          }
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      }

      $scope.deleteRfid = function (object) {
        if (object.status !== 2) {
          return;
        }
        let modalOptions = {
          bodyText: 'Вы действительно хотите удалить карту ' + object.rfid + '?'
        }
        ModalService.showModal(null, modalOptions).then(function (result) {
          if (result) {
            ObjectRfidService.deleteRfid({rfid: object.rfid}, function (result) {
              $scope.objectsRfid = $scope.objectsRfid.filter(function (item) {
                return item.rfid !== object.rfid;
              })
              toaster.pop('success', "", 'Карта удалена');
            }, function (error) {
              toaster.pop('error', "", error.data.message);
            });
          }
        });
      }

      $scope.editRfid = function (object) {
        $scope.cancelEdit();
        $scope.origVehicles = angular.copy($scope.vehicles);
        $scope.selectedObjectRfid = angular.copy(object);
        $scope.ui.vehicles.push({id: object.vehicleId, name: object.vehicleName});
      }

      $scope.cancelEdit = function () {
        $scope.vehicles = angular.copy($scope.origVehicles);
        $scope.selectedObjectRfid = null;
      }

      $scope.saveRfid = function (object) {
        let updatedObj = {
          rfid: $scope.selectedObjectRfid.rfid,
          name: $scope.selectedObjectRfid.name === object.name ? null : $scope.selectedObjectRfid.name,
          idUserTelegram: $scope.idUserTelegram,
          limit: $scope.selectedObjectRfid.dailyLimit === object.dailyLimit ? null : $scope.selectedObjectRfid.dailyLimit,
          status: $scope.selectedObjectRfid.status === object.status ? null : $scope.selectedObjectRfid.status,
          rfidType: $scope.selectedObjectRfid.typeId === object.typeId ? null : $scope.selectedObjectRfid.typeId,
          storehouseId: $scope.selectedObjectRfid.storehouseId === object.storehouseId ? null : $scope.selectedObjectRfid.storehouseId,
          pinCode: $scope.selectedObjectRfid.pinCode,
          employeeId: $scope.selectedObjectRfid.employeeId,
          vehicleId: $scope.selectedObjectRfid.vehicleId,
          partnerId: $scope.selectedObjectRfid.partnerId,
          limitTypeId: $scope.selectedObjectRfid.limitTypeId,
          divisionId: $scope.selectedObjectRfid.divisionId
        }

        ObjectRfidService.updateRfidName(updatedObj, function (result) {
          object.rfid = $scope.selectedObjectRfid.rfid;
          object.name = $scope.selectedObjectRfid.name;
          object.idUserTelegram = $scope.selectedObjectRfid.idUserTelegram;
          object.dailyLimit = $scope.selectedObjectRfid.dailyLimit;
          object.status = $scope.selectedObjectRfid.status;
          object.typeId = $scope.selectedObjectRfid.typeId;
          object.storehouseId = $scope.selectedObjectRfid.storehouseId;
          object.pinCode = $scope.selectedObjectRfid.pinCode;
          object.employeeId = $scope.selectedObjectRfid.employeeId;
          object.vehicleId = $scope.selectedObjectRfid.vehicleId;
          object.partnerId = $scope.selectedObjectRfid.partnerId;
          object.limitTypeId = $scope.selectedObjectRfid.limitTypeId;
          object.divisionId = $scope.selectedObjectRfid.divisionId;

          object.divisionName = $scope.divisions.find(function (o) {
            return o.id === object.divisionId;
          }).name;
          object.partnerName = $scope.partners.find(function (o) {
            return o.id === object.partnerId;
          }).name;
          object.vehicleName = $scope.ui.vehicles.find(function (o) {
            return o.id === object.vehicleId;
          }).name;
          object.storehouseName = $scope.storehouses.find(function (o) {
            return o.id === object.storehouseId;
          }).name;
          object.employeeName = $scope.employees.find(function (o) {
            return o.id === object.employeeId;
          }).name;
          object.limitTypeName = $scope.limitTypes.find(function (o) {
            return o.id === object.limitTypeId;
          }).name;
          object.typeName = $scope.objectsRfidTypes.find(function (o) {
            return o.id === object.typeId;
          }).name;
          
          
          $scope.selectedObjectRfid = null;
          object.dailyBalance = object.dailyLimit
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      }

      $scope.setStatus = function (object) {
        let params = {
          rfid: object.rfid,
          idUserTelegram: $scope.idUserTelegram
        };
        if (object.status === 2) {
          ObjectRfidService.unlockRfid(params, function (result) {
            $scope.getObjectsRfid();
          }, function (error) {
            toaster.pop('error', "", error.data.message);
          });
        } else {
          ObjectRfidService.lockRfid(params, function (result) {
            $scope.getObjectsRfid();
          }, function (error) {
            toaster.pop('error', "", error.data.message);
          });
        }
      }

      $rootScope.$watch('ui.search', function (newVal, oldVal) {
        if (newVal !== oldVal) {
          $scope.search = newVal;
        }
      }, true);

      $rootScope.$watch('currentUser.currentProductId', function (newVal, oldVal) {
        if (newVal !== oldVal) {
          $scope.getObjectsRfid();
        }
      }, true);

      $scope.getPartners = function () {
        PartnerService.get({}, function (result) {
          $scope.partners = [{id: 0, name: null}]
          $scope.partners = $scope.partners.concat(result);
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.getDivisions = function () {
        DivisionService.get({}, function (result) {
          $scope.divisions = [{id: 0, name: null}]
          $scope.divisions = $scope.divisions.concat(result);
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $rootScope.$on('updateCurrentDivision', function (event, data) {
        $scope.getObjectsRfid();
      });

      $rootScope.$on('updateCurrentPartner', function (event, data) {
        $scope.getObjectsRfid();
      });

      $scope.currentRfid = null;
      $scope.setCurrentRfid = function (rfid) {
        $scope.currentRfid = rfid;
        $rootScope.$broadcast('setCurrentRfid', {currentRfid: rfid});
      };

      $scope.getStorehouses();
      $scope.getEmployees();
      $scope.getObjectRfidType();
      $scope.getObjectsRfid();
      $scope.getDivisions();
      $scope.getPartners();
      $scope.getLimitTypes();
    }]);
