angular.module('exzotron')
  .factory('DivisionService', ['$resource', 'API', function ($resource, API) {
    return $resource(API.division, {}, {
      'get': {method: 'GET', isArray: true},
      'add': {method: 'POST', isArray: false},
      'save': {method: 'PUT', isArray: false},
      'delete': {method: 'DELETE', isArray: false, params: {id: '@id'}}
    });
  }]);
