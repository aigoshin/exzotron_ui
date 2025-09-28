'use strict';

angular.module('exzotron')
  .factory('AuthProvider', ['$http', function ($http) {
    return {
      login: function (credentials) {
        var data = 'username=' + encodeURIComponent(credentials.username) +
          '&password=' + encodeURIComponent(credentials.password) +
          '&lang=' + encodeURIComponent(credentials.lang);
        return $http.post('/login', data, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }).then(function (response) {
          return response;
        });
      },
      logout: function () {
        $http.post('/logout', {}).then(function (response) {
          return response;
        });
      }
    };
  }]);
