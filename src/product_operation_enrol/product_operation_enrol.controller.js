angular.module('exzotron')
  .controller('ProductOperationEnrolController', ['$scope', '$rootScope', 'BalanceService', 'ModalService', 'toaster', 'AccountService', 'UserService', '$location', '$filter', '$window',
    function ($scope, $rootScope, BalanceService, ModalService, toaster, AccountService, UserService, $location, $filter, $window) {
      $scope.search = '';
      $scope.dateFrom = $rootScope.ui.dateFrom;
      $scope.dateTo = $rootScope.ui.dateTo;
      $scope.accountOperations = [];
      $scope.newOperation = {
        rfid: null,
        count: 0,
        idUserTelegram: null,
        idProduct: null
      };

      $scope.initNewOperation = function () {
        $scope.newOperation.idUserTelegram = UserService.storage.currentUser.telegram;
        $scope.newOperation.idProduct = UserService.storage.currentUser.currentProductId;
      }

      $scope.getAccountOperations = function () {
        $scope.accountOperations = [];
        const startDate = moment($rootScope.ui.dateFrom).format('YYYY-MM-DD HH:mm:ss');
        const endDate = moment($rootScope.ui.dateTo).format('YYYY-MM-DD HH:mm:ss');
        const groupByObjects = false;

        BalanceService.getAccountOperations({startDate, endDate, groupByObjects}, function (result) {
          $scope.accountOperations = result.filter(function (item){
              return item.debit!==0;
          });
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      }

      $scope.moveCount = function () {
        AccountService.moveCount($scope.newOperation, function (result) {
          if (result.data.indexOf('Lock!!!') > -1) {
            toaster.pop('error', "", result.data);
          } else {
            $scope.newOperation.count = 0;
            toaster.pop('success', "", "Успешно");
            $scope.getAccountOperations();
          }
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      }

      $scope.selectAccountOperation = function (accountOperation) {
        $scope.selectedAccountOperation = accountOperation
        $scope.newOperation.rfid = accountOperation.account
      }

      $scope.edit = function (accountOperation){
        $scope.editableItem = accountOperation;
      }

      $scope.toggleDeleteStatus = function (accountOperation){
        let operationId = accountOperation.accountOperationId;
        BalanceService.toggleDeleteStatus({operationId}, function (result) {
          accountOperation.toDelete = !accountOperation.toDelete;
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      }

      $scope.cancel = function (){
        $scope.editableItem = null;
      }

      $rootScope.$watch('ui.search', function (newVal, oldVal) {
        if (newVal !== oldVal) {
          $scope.search = newVal;
        }
      }, true);

      $scope.checkPath = function () {
        return $location.path() === '/enrol';
      }

      $rootScope.$watch('ui.dateFrom', function (newVal, oldVal) {
        if ($scope.checkPath() && moment(newVal).format('YYYY-MM-DD HH:mm') !== moment(oldVal).format('YYYY-MM-DD HH:mm')) {
          $scope.getAccountOperations();
        }
      }, true);

      $rootScope.$watch('ui.dateTo', function (newVal, oldVal) {
        if ($scope.checkPath() && newVal !== oldVal && moment(newVal).format('YYYY-MM-DD HH:mm') !== moment(oldVal).format('YYYY-MM-DD HH:mm')) {
          $scope.getAccountOperations();
        }
      }, true);

      $rootScope.$watch('currentUser.currentProductId', function (newVal, oldVal) {
        if ($scope.checkPath() && newVal !== oldVal && $scope.checkPath()) {
          $scope.newOperation.idProduct = newVal;
          $scope.getAccountOperations();
        }
      }, true);


      $rootScope.$on('updateCurrentPartner', function (event, data) {
        $scope.getAccountOperations();
      });

      $rootScope.$on('selectRfidObjectEnrol', function (event, data) {
        $scope.newOperation.rfid = data.selectedRfidObjectEnrol.rfid;
      });

      $scope.getAccountOperations();
    }]);
