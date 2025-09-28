angular.module('exzotron')
  .controller('ObjectController', ['$scope', '$rootScope', 'ObjectService', 'ModalService', 'toaster', '$location',
    function ($scope, $rootScope, ObjectService, ModalService, toaster, $location) {
      $scope.objects = [];
      $scope.search = '';
      $scope.superUser = $rootScope.currentUser.superUser;
      $scope.ui = {
        licenseDateField: false
      }

      $scope.newObject = {
        name: null,
        imei: null,
        phone: ''
      };
      $rootScope.currentObject = null;
      $scope.objectData = [];
      $scope.dataId = null;

      $scope.setCurrentDataRow = function (item){
          $scope.dataId = item.id;
      }

      $scope.exportObjectDataExcel = function () {
        if (!$rootScope.currentObject) {
          return;
        }
        const imei = $rootScope.currentObject.imei;
        if (!imei) {
          return;
        }
        const startDate = moment($rootScope.ui.dateFrom).format('YYYY-MM-DD HH:mm:ss');
        const endDate = moment($rootScope.ui.dateTo).format('YYYY-MM-DD HH:mm:ss');
        $rootScope.exportExcel('api/v1/export_object_data?startDate=' + startDate + '&endDate=' + endDate + '&imei=' + imei, 'GET', {}, 'ex_d_' + imei + '.xls');
      }

      $scope.getObjects = function () {
        ObjectService.getObjectsForCurrentUser({}, function (result) {
          $scope.objects = result;
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      }

      $scope.deleteObject = function (object) {
        let modalOptions = {
          bodyText: 'Вы действительно хотите удалить объект ' + object.name + '?'
        }
        ModalService.showModal(null, modalOptions).then(function (result) {
          if (result) {
            ObjectService.deleteObjectByImei({imei: object.imei}, function (result) {
              $scope.objects = $scope.objects.filter(function (item) {
                return item.id !== object.id;
              })
            }, function (error) {
              toaster.pop('error', "", error.data.message);
            });
          }
        });
      }

      $scope.editObject = function (object) {
        $scope.selectedObject = angular.copy(object);
      }

      $scope.cancelEdit = function () {
        $scope.selectedObject = null;
      }

      $scope.onLicenseDateSet = function (newVal, oldVal){
        $scope.ui.licenseDateField = false;
      }


      $scope.saveObject = function (object) {
        ObjectService.updateObjectName({
          imei: $scope.selectedObject.imei,
          name: $scope.selectedObject.name,
          phone: $scope.selectedObject.phoneNumber,
          productId: $scope.selectedObject.productId,
          divisionId: $scope.selectedObject.divisionId,
          licenseDate: $scope.selectedObject.licenseDate,
          trkTypeId: $scope.selectedObject.trkTypeId
        }, function (result) {
          $scope.getObjects();
          $scope.selectedObject = null;
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      }

      $scope.getObjectData = function (object) {
        $scope.objectData = [];
        if (!$rootScope.currentObject) {
          return;
        }
        if ($rootScope.currentObject.imei!==object.imei) {
          return;
        }
        const imei = $rootScope.currentObject.imei;
        if (!imei) {
          return;
        }
        const startDate = moment($rootScope.ui.dateFrom).format('YYYY-MM-DD HH:mm:ss');
        const endDate = moment($rootScope.ui.dateTo).format('YYYY-MM-DD HH:mm:ss');

        ObjectService.getObjectData({imei, startDate, endDate}, function (result) {
          $scope.objectData = result;
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      }


      $scope.addObject = function () {
        ObjectService.addObject({
          imei: $scope.newObject.imei,
          name: $scope.newObject.name,
          phone: $scope.newObject.phone
        }, function (result) {
          $scope.newObject = {
            name: null,
            imei: null,
            phone: ''
          };
          toaster.pop('success', "", 'Объект добавлен!');
          $scope.getObjects();
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      }

      $scope.setStatus = function (object) {
        let params = {
          imei: object.imei,
          status: object.dataExchange === 0 ? 1 : 0
        };
        object.dataExchange = 3;//fire spinner
        ObjectService.setDataExchange(params, function (result) {
          $scope.getObjects();
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      }

      $scope.checkPath = function () {
        return $location.path() === '/object';
      }

      $scope.setCurrentObject = function (object) {
        if($rootScope.currentObject  && $rootScope.currentObject.imei!==object.imei){
          $scope.objectData = [];
        }
        $rootScope.currentObject = object;
      }

      $scope.$on('updateCurrentDivision', function (event, data) {
        $scope.getObjects();
      });

      $rootScope.$watch('ui.search', function (newVal, oldVal) {
        if (newVal !== oldVal) {
          $scope.search = newVal;
        }
      }, true);

      $rootScope.$watch('ui.dateFrom', function (newVal, oldVal) {
        if ($scope.checkPath() && moment(newVal).format('YYYY-MM-DD HH:mm') !== moment(oldVal).format('YYYY-MM-DD HH:mm')) {
          $scope.getObjectData();
        }
      }, true);

      $rootScope.$watch('ui.dateTo', function (newVal, oldVal) {
        if ($scope.checkPath() && newVal !== oldVal && moment(newVal).format('YYYY-MM-DD HH:mm') !== moment(oldVal).format('YYYY-MM-DD HH:mm')) {
          $scope.getObjectData();
        }
      }, true);

      $scope.getObjects();
    }]);
