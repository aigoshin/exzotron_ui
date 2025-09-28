angular.module('exzotron')
  .controller('DivisionController', ['$scope', '$rootScope', 'DivisionService', 'toaster',
    function ($scope, $rootScope, DivisionService, toaster) {
      $scope.divisions = [];
      $scope.selectedItem = null;
      $scope.newItem = {};
      $scope.search = '';

      $rootScope.$watch('ui.search', function (newVal, oldVal) {
        if (newVal !== oldVal) {
          $scope.search = newVal;
        }
      }, true);

      $scope.getDivisions = function () {
        DivisionService.get({}, function (result) {
          $scope.divisions = result;
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.save = function () {
        DivisionService.save($scope.selectedItem, function (result) {
          $scope.selectedItem = null;
          $scope.getDivisions();
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.delete = function (item) {
        DivisionService.delete({'id': item.id}, function (result) {
          $scope.getDivisions();
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.edit = function (item) {
        $scope.selectedItem = angular.copy(item)
      };

      $scope.add = function () {
        DivisionService.add($scope.newItem, function (result) {
          $scope.getDivisions();
          $scope.newItem = {};
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.cancel = function () {
        $scope.selectedItem = null;
      }

      $scope.getDivisions();
    }]);
