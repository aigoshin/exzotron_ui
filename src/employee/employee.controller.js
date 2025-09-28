angular.module('exzotron')
  .controller('EmployeeController', ['$scope', '$rootScope', 'EmployeeService', 'toaster',
    function ($scope, $rootScope, EmployeeService, toaster) {
      $scope.employees = [];
      $scope.selectedItem = null;
      $scope.newItem = null;
      $scope.search = '';

      $scope.$on('updateCurrentDivision', function (event, data) {
        $scope.getEmployees();
      });

      $rootScope.$watch('ui.search', function (newVal, oldVal) {
        if (newVal !== oldVal) {
          $scope.search = newVal;
        }
      }, true);

      $scope.getEmployees = function () {
        EmployeeService.get({}, function (result) {
          $scope.employees = result;
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.save = function () {
        EmployeeService.save($scope.selectedItem, function (result) {
          $scope.selectedItem = null;
          $scope.getEmployees();
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.delete = function (item) {
        EmployeeService.delete({'id': item.id}, function (result) {
          $scope.getEmployees();
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.edit = function (item) {
        $scope.selectedItem = angular.copy(item)
      };

      $scope.add = function () {
        EmployeeService.add($scope.newItem, function (result) {
          $scope.getEmployees();
          $scope.newItem = null;
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.cancel = function () {
        $scope.selectedItem = null;
      }

      $scope.selectItem = function (item) {
        if ($scope.selectedEmployee && $scope.selectedEmployee.id === item.id) {
          $scope.selectedEmployee = null;
        } else {
          $scope.selectedEmployee = item;
        }

        $rootScope.$broadcast('selectEmployee', {selectedEmployee: $scope.selectedEmployee});
      }

      $scope.getEmployees();
    }]);
