(function () {
  'use strict';

  angular.module('exzotron').service('ModalService', ['$uibModal', modalService]);

  function modalService($uibModal) {
    var modalDefaults = {
      backdrop: true,
      animation: false,
      size: 'md',
      templateUrl: 'static/src/tpl/modal.html'
    };

    var options = {
      closeButtonText: 'Close',
      actionButtonText: 'OK',
      showCancel:  true,
      showOk: true
    };

    this.showModal = function (customModalDefaults, customModalOptions) {
      if (!customModalDefaults) {
        customModalDefaults = {};
      }
      return this.show(customModalDefaults, customModalOptions);
    };

    this.show = function (customModalDefaults, customModalOptions) {
      var tempModalDefaults = {};
      var tempModalOptions = {};

      angular.extend(tempModalDefaults, modalDefaults, customModalDefaults);
      angular.extend(tempModalOptions, options, customModalOptions);

      if (!tempModalDefaults.controller) {
        tempModalDefaults.controller = ['$scope', '$uibModalInstance', function ($scope, $uibModalInstance) {

          $scope.modalOptions = tempModalOptions;

          $scope.modalOptions.ok = function (result) {
            $uibModalInstance.close(result);
          };

          $scope.modalOptions.cancel = function () {
            $uibModalInstance.dismiss('cancel');
          };
        }];
      }
      return $uibModal.open(tempModalDefaults).result;
    };
  }

})();
