angular.module('exzotron')
  .controller('UserController', ['$scope', '$rootScope', 'UserService', 'toaster',  'MenuService', 'CompanyService', 'PartnerService',
    function ($scope, $rootScope, UserService, toaster, MenuService, CompanyService, PartnerService) {
      $scope.users = [];
      $scope.companies = [];
      $scope.menuItems = [];
      $scope.userRoles = [];
      $scope.selectedItem = null;
      $scope.newItem = null;
      $scope.search = '';

      $rootScope.$watch('ui.search', function (newVal, oldVal) {
        if (newVal !== oldVal) {
          $scope.search = newVal;
        }
      }, true);

      $scope.getUsers = function () {
        UserService.request.getUsersByCurrentCompany({}, function (result) {
          $scope.users = result;
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.getCompanies = function () {
        CompanyService.get({}, function (result) {
          $scope.companies = result;
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.getMenuItems = function () {
        MenuService.getAllMenuItems({}, function (result) {
          $scope.menuItems = result;
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.getUserRoles = function () {
        UserService.crud.roles({}, function (result) {
          $scope.userRoles = result;
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.save = function () {
        UserService.crud.save($scope.selectedItem, function (result) {
          $scope.selectedItem = null;
          $scope.getUsers();
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.delete = function (item) {
        UserService.crud.delete({'id': item.usersId}, function (result) {
          $scope.getUsers();
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.edit = function (item) {
        $scope.selectedItem = angular.copy(item)
      };

      $scope.add = function () {
        UserService.crud.add($scope.newItem, function (result) {
          $scope.getUsers();
          $scope.newItem = null;
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.cancel = function () {
        $scope.selectedItem = null;
      }

      $scope.getUsers();
      $scope.getMenuItems();
      $scope.getCompanies();
      $scope.getUserRoles();
    }]);
