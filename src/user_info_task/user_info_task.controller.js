angular.module('exzotron')
  .controller('UserInfoTaskController', ['$scope', '$rootScope', 'UserInfoTaskService', 'toaster', 'ObjectService',
    'UserService', 'PartnerService', 'DivisionService', 'ObjectRfidService',
    function ($scope, $rootScope, UserInfoTaskService, toaster, ObjectService,
              UserService, PartnerService, DivisionService, ObjectRfidService) {
      $scope.items = [];
      $scope.selectedItem = null;
      $scope.newItem = {};
      $scope.search = '';
      
      $rootScope.$broadcast('setCurrentCompany', {currentCompany: $rootScope.currentCompany});
      
      $scope.$on('selectChatUser', function (event, data) {
        $scope.selectedUser = data.user;
      });
      
      $scope.filterByUser = function (item) {
        if (!$scope.selectedUser) {
          return true;
        }
        return $scope.selectedUser.usersId === item.recipientId;
      };
      
      
      $rootScope.$watch('ui.search', function (newVal, oldVal) {
        if (newVal !== oldVal) {
          $scope.search = newVal;
        }
      }, true);

      $scope.getItems = function () {
        UserInfoTaskService.get({}, function (result) {
          $scope.items = result;
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.save = function () {
        UserInfoTaskService.save($scope.selectedItem, function (result) {
          $scope.selectedItem = null;
          $scope.getItems();
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.delete = function (item) {
        UserInfoTaskService.delete({'id': item.id}, function (result) {
          $scope.getItems();
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.edit = function (item) {
        $scope.selectedItem = angular.copy(item)
      };

      $scope.add = function () {
        UserInfoTaskService.add($scope.newItem, function (result) {
          $scope.getItems();
          $scope.newItem = {};
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.cancel = function () {
        $scope.selectedItem = null;
      }

      $scope.getObjects = function () {
        ObjectService.getObjects({}, function (result) {
          $scope.objects = result;
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.getUsers = function () {
        UserService.crud.get({}, function (result) {
          $scope.users = result;
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.getPartners = function () {
        PartnerService.get({}, function (result) {
          $scope.partners = result;
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.getDivisions = function () {
        DivisionService.get({}, function (result) {
          $scope.divisions = result;
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.getObjectsRfid = function () {
        ObjectRfidService.getObjectsRfidForCurrentUser({}, function (result) {
          $scope.objectsRfid = result;
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.getTypes = function () {
        UserInfoTaskService.types({}, function (result) {
          $scope.taskTypes = result;
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.getItems();
      $scope.getObjects();
      $scope.getUsers();
      $scope.getPartners();
      $scope.getDivisions();
      // $scope.getObjectsRfid();
      $scope.getTypes();
    }]);
