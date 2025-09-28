angular.module('exzotron')
  .controller('CalibrationController', ['$scope', '$rootScope', 'CalibrationService', 'toaster',
    function ($scope, $rootScope, CalibrationService, toaster) {
      $scope.calibrationLog = [];
      $scope.selectedItem = null;
      $scope.search = '';

      $scope.calibrationSplitPaneProperties = {};

      $rootScope.$watch('ui.search', function (newVal, oldVal) {
        if (newVal !== oldVal) {
          $scope.search = newVal;
        }
      }, true);

      $scope.getCalibrationLog = function () {
        var startDate = moment($rootScope.ui.dateFrom).format('YYYY-MM-DD HH:mm:ss');
        var endDate = moment($rootScope.ui.dateTo).format('YYYY-MM-DD HH:mm:ss');
        CalibrationService.get({startDate, endDate}, function (result) {
          $scope.calibrationLog = result;
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.save = function () {
        CalibrationService.save($scope.selectedItem, function (result) {
          $scope.selectedItem = null;
          $scope.getCalibrationLog();
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.edit = function (item) {
        $scope.selectedItem = angular.copy(item)
      };

      $scope.cancel = function () {
        $scope.selectedItem = null;
      }

      $scope.setCurrentCalibration = function (item) {
        $scope.selectedPhoto = null;
        $scope.currentCalibration = item;
        $scope.getCalibrationLogPhotos(item.id);
        $rootScope.$broadcast('setCurrentCalibration', {currentCalibration: item});
      }

      $scope.getCalibrationLogPhotos = function (calibrationId) {
        CalibrationService.getCalibrationLogPhotos({calibrationId}, function (result) {
          $scope.photos = result;
          if (result.length) {
            $scope.selectedPhoto = result[0];
          }
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      }

      $scope.selectPhoto = function (photo) {
        $scope.selectedPhoto = photo;
      }

      $rootScope.$watch('ui.dateFrom', function (newVal, oldVal) {
        if (newVal !== oldVal) {
          $scope.getCalibrationLog();
        }
      }, true);

      $rootScope.$watch('ui.dateTo', function (newVal, oldVal) {
        if (newVal !== oldVal) {
          $scope.getCalibrationLog();
        }
      }, true);

      $scope.getCalibrationLog();
    }]);
