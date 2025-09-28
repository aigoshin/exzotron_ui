'use strict';

angular
  .module('exzotron')
  .service('authInterceptor', ['$q', '$location', '$window', 'toaster', function ($q, $location, $window, toaster) {
    let service = this;

    service.responseError = function (response) {
      if (response.status === 401 || response.status === 405 || response.status === 403) {
        toaster.pop('error', "", response.data);
      }
      return $q.reject(response);
    };
  }])
  .config(['$httpProvider', function ($httpProvider) {
    $httpProvider.interceptors.push('authInterceptor');
  }]);
