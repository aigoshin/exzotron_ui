angular.module('exzotron')
  .controller('TrailerController', ['$scope', '$rootScope', '$location', 'toaster', 'TrailerService',
    function ($scope, $rootScope, $location, toaster, TrailerService) {
      $scope.operations = [];
      $scope.selectedItem = null;
      $scope.newItem = null;
      $scope.search = '';
      $scope.trailers = [];

      $rootScope.$watch('ui.search', function (newVal, oldVal) {
        if (newVal !== oldVal) {
          $scope.search = newVal;
        }
      }, true);

      $scope.getTrailers = function () {
        $scope.trailers = [];
        TrailerService.get({}, function (result) {
          $scope.trailers = result;
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.save = function () {
        TrailerService.save($scope.selectedItem, function (result) {
          $scope.selectedItem = null;
          $scope.getTrailers();
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.setCurrentTrailer = function (item){
        $scope.currentTrailer = item;
      }

      $scope.add = function () {
        TrailerService.add($scope.newItem, function (result) {
          $scope.getTrailers();
          $scope.newItem = null;
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.delete = function (item) {
        TrailerService.delete({'id': item.id}, function (result) {
          $scope.getTrailers();
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


      $rootScope.$watch('ui.dateFrom', function (newVal, oldVal) {
        if ($scope.checkPath() && newVal !== oldVal) {
          $scope.getTrailers();
        }
      }, true);

      $rootScope.$watch('ui.dateTo', function (newVal, oldVal) {
        if ($scope.checkPath() && newVal !== oldVal) {
          $scope.getTrailers();
        }
      }, true);

      $scope.checkPath = function () {
        return $location.path() === '/trailers';
      }

      $scope.getTrailers();
    }]);
