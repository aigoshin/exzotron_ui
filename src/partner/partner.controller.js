angular.module('exzotron')
  .controller('PartnerController', ['$scope', '$rootScope', 'PartnerService', 'toaster',
    function ($scope, $rootScope, PartnerService, toaster) {
      $scope.partners = [];
      $scope.types = [];
      $scope.selectedItem = null;
      $scope.newItem = {};
      $scope.search = '';

      $rootScope.$watch('ui.search', function (newVal, oldVal) {
        if (newVal !== oldVal) {
          $scope.search = newVal;
        }
      }, true);

      $scope.getPartners = function () {
        PartnerService.get({}, function (result) {
          $scope.partners = result;
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.getTypes = function () {
        PartnerService.types({}, function (result) {
          $scope.types = result;
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.save = function () {
        PartnerService.save($scope.selectedItem, function (result) {
          $scope.selectedItem = null;
          $scope.getPartners();
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.delete = function (item) {
        PartnerService.delete({'id': item.id}, function (result) {
          $scope.getPartners();
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.edit = function (item) {
        $scope.selectedItem = angular.copy(item)
      };

      $scope.add = function () {
        PartnerService.add($scope.newItem, function (result) {
          $scope.getPartners();
          $scope.newItem = {};
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.cancel = function () {
        $scope.selectedItem = null;
      }

      $scope.selectPartner = function (item){
        $scope.selectedPartner = item;
        $rootScope.$broadcast('selectPartner', {selectedPartner: item});
      }

      $scope.getPartners();
      $scope.getTypes();
    }]);
